import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;

    if (!resolvedParams?.id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const userId = resolvedParams.id;

    // Verify that prisma client is initialized
    if (!prisma?.rating) {
      throw new Error("Prisma client is not properly initialized");
    }

    // Get all ratings for the user (both as buyer and seller)
    const ratings = await prisma.rating.findMany({
      where: {
        OR: [
          { userId: userId }, // Ratings where user is buyer
          { sellerId: userId }, // Ratings where user is seller
        ],
      },
      select: {
        score: true,
        userId: true,
        sellerId: true,
      },
    });

    // Calculate overall stats
    const total = ratings.length;
    const totalScore = ratings.reduce((sum, rating) => sum + rating.score, 0);
    const averageRating = total > 0 ? (totalScore / total).toFixed(1) : "0.0";

    // Calculate buyer stats
    const buyerRatings = ratings.filter((rating) => rating.userId === userId);
    const asBuyer = buyerRatings.length;
    const asBuyerScore = buyerRatings.reduce(
      (sum, rating) => sum + rating.score,
      0
    );
    const asBuyerAvg =
      asBuyer > 0 ? (asBuyerScore / asBuyer).toFixed(1) : "0.0";

    // Calculate seller stats
    const sellerRatings = ratings.filter(
      (rating) => rating.sellerId === userId
    );
    const asSeller = sellerRatings.length;
    const asSellerScore = sellerRatings.reduce(
      (sum, rating) => sum + rating.score,
      0
    );
    const asSellerAvg =
      asSeller > 0 ? (asSellerScore / asSeller).toFixed(1) : "0.0";

    return NextResponse.json({
      total,
      averageRating,
      asBuyer,
      asBuyerAvg,
      asSeller,
      asSellerAvg,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats: " + error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, context) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all"; // all, buyer, seller
    const sortBy = searchParams.get("sortBy") || "newest"; // newest, oldest, rating-high, rating-low

    let whereClause = {};
    if (type === "buyer") {
      whereClause = { userId: id };
    } else if (type === "seller") {
      whereClause = { sellerId: id };
    } else {
      whereClause = {
        OR: [{ userId: id }, { sellerId: id }],
      };
    }

    let orderBy = {};
    switch (sortBy) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "rating-high":
        orderBy = { score: "desc" };
        break;
      case "rating-low":
        orderBy = { score: "asc" };
        break;
      default: // newest
        orderBy = { createdAt: "desc" };
    }

    const reviews = await prisma.rating.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            username: true,
            profilePicture: true,
          },
        },
        seller: {
          select: {
            username: true,
            profilePicture: true,
          },
        },
        listing: {
          select: {
            name: true,
          },
        },
      },
      orderBy,
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch user reviews" },
      { status: 500 }
    );
  }
}

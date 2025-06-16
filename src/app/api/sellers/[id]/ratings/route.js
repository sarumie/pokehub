import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, context) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Seller ID is required" },
        { status: 400 }
      );
    }

    // Fetch seller basic info
    const seller = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        profilePicture: true,
        fullName: true,
      },
    });

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    // Get all ratings for this seller
    const ratings = await prisma.rating.findMany({
      where: { sellerId: id },
      include: {
        user: {
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate overall rating
    const totalRating = ratings.reduce((sum, rating) => sum + rating.score, 0);
    const overallRating = ratings.length > 0 ? totalRating / ratings.length : 0;

    // Get recent 3 reviews (only those with review text)
    const recentReviews = ratings
      .filter((rating) => rating.review && rating.review.trim() !== "")
      .slice(0, 3)
      .map((rating) => ({
        id: rating.id,
        reviewerName: rating.user.username,
        reviewerAvatar: rating.user.profilePicture || "/api/placeholder/32/32",
        rating: rating.score,
        comment: rating.review,
        timeAgo: formatTimeAgo(rating.createdAt),
        listingName: rating.listing.name,
      }));

    const response = {
      seller: {
        id: seller.id,
        username: seller.username,
        profilePicture: seller.profilePicture || "/api/placeholder/40/40",
        overallRating: Math.round(overallRating * 10) / 10, // Round to 1 decimal
        totalReviews: ratings.length,
      },
      recentReviews,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching seller ratings:", error);
    return NextResponse.json(
      { error: "Failed to fetch seller ratings" },
      { status: 500 }
    );
  }
}

function formatTimeAgo(date) {
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInYears > 0) {
    return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
  } else if (diffInMonths > 0) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  } else if (diffInWeeks > 0) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
  } else if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  } else {
    return "Just now";
  }
}

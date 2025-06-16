import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, context) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const byUsername = searchParams.get("username") === "true";

    if (!id) {
      return NextResponse.json(
        { error: "User ID or username is required" },
        { status: 400 }
      );
    }

    // Determine if we're searching by username or ID
    const whereClause = byUsername ? { username: id } : { id };

    // Fetch user profile
    const user = await prisma.user.findUnique({
      where: whereClause,
      include: {
        shipDetails: {
          select: {
            city: true,
            province: true,
          },
        },
        listings: {
          include: {
            seller: {
              select: {
                username: true,
                profilePicture: true,
                fullName: true,
                shipDetails: {
                  select: {
                    city: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        ratingsReceived: {
          select: {
            score: true,
          },
        },
        _count: {
          select: {
            ratingsReceived: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate average rating
    const totalRating = user.ratingsReceived.reduce(
      (sum, rating) => sum + rating.score,
      0
    );
    const averageRating =
      user.ratingsReceived.length > 0
        ? totalRating / user.ratingsReceived.length
        : 0;

    // Remove sensitive information and format response
    const publicUser = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
      location: user.shipDetails?.city || null,
      province: user.shipDetails?.province || null,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      reviewCount: user._count.ratingsReceived,
      listings: user.listings,
    };

    return NextResponse.json(publicUser);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

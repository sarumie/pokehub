import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const listings = await prisma.listing.findMany({
      take: 4, // Limit to 4 trending items
      orderBy: {
        seenCount: "desc", // Order by most viewed
      },
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
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error("Error fetching trending listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending listings" },
      { status: 500 }
    );
  }
}

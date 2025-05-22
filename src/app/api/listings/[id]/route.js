import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request, context) {
  try {
    const params = await context.params;
    const listing = await prisma.listing.findUnique({
      where: {
        id: params.id,
      },
      include: {
        seller: {
          select: {
            username: true,
            profilePicture: true,
            shipDetails: {
              select: {
                city: true,
              },
            },
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const cartItems = await prisma.cart.findMany({
      where: {
        idUser: userId,
      },
      include: {
        listing: {
          select: {
            name: true,
            pictUrl: true,
            price: true,
            stock: true,
          },
        },
      },
    });

    return NextResponse.json(cartItems);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId, listingId, quantity } = await request.json();

    if (!userId || !listingId || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the listing to calculate total price
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cart.findFirst({
      where: {
        idUser: userId,
        idListings: listingId,
      },
    });

    if (existingCartItem) {
      // Update quantity and total price
      const updatedCartItem = await prisma.cart.update({
        where: { id: existingCartItem.id },
        data: {
          totalPrice: listing.price * quantity,
        },
      });
      return NextResponse.json(updatedCartItem);
    }

    // Create new cart item
    const cartItem = await prisma.cart.create({
      data: {
        idUser: userId,
        idListings: listingId,
        totalPrice: listing.price * quantity,
      },
    });

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

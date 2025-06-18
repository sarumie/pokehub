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
            seller: {
              select: {
                id: true,
                username: true,
                profilePicture: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
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
          quantity: quantity,
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
        quantity: quantity,
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

export async function PUT(request) {
  try {
    const { cartItemId, quantity } = await request.json();

    if (!cartItemId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid cart item ID or quantity" },
        { status: 400 }
      );
    }

    // Get the cart item and listing to calculate new total price
    const cartItem = await prisma.cart.findUnique({
      where: { id: cartItemId },
      include: { listing: true },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    // Update quantity and total price
    const updatedCartItem = await prisma.cart.update({
      where: { id: cartItemId },
      data: {
        quantity: quantity,
        totalPrice: cartItem.listing.price * quantity,
      },
      include: {
        listing: {
          select: {
            name: true,
            pictUrl: true,
            price: true,
            stock: true,
            seller: {
              select: {
                id: true,
                username: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedCartItem);
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cartItemId = searchParams.get("cartItemId");

    if (!cartItemId) {
      return NextResponse.json(
        { error: "Cart item ID is required" },
        { status: 400 }
      );
    }

    await prisma.cart.delete({
      where: { id: cartItemId },
    });

    return NextResponse.json({ message: "Cart item deleted successfully" });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

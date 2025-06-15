import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET user address
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        shipDetails: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.shipDetails) {
      return NextResponse.json({ address: null });
    }

    // Map database fields to frontend fields
    const address = {
      namaAlamat: user.shipDetails.name,
      alamatLengkap: user.shipDetails.address,
      namaPenerima: user.shipDetails.receiver,
      kota: user.shipDetails.city,
      kodePos: user.shipDetails.postalCode,
      provinsi: user.shipDetails.province,
    };

    return NextResponse.json({ address });
  } catch (error) {
    console.error("Error fetching user address:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new address
export async function POST(request) {
  try {
    const { userId, namaAlamat, alamatLengkap, namaPenerima, kota, kodePos } =
      await request.json();

    if (
      !userId ||
      !namaAlamat ||
      !alamatLengkap ||
      !namaPenerima ||
      !kota ||
      !kodePos
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create new address
    const newAddress = await prisma.addressDetails.create({
      data: {
        name: namaAlamat,
        address: alamatLengkap,
        receiver: namaPenerima,
        city: kota,
        postalCode: kodePos,
        province: "", // Set default province for now
      },
    });

    // Update user to link to this address
    await prisma.user.update({
      where: { id: userId },
      data: {
        idAddressDetails: newAddress.id,
      },
    });

    // Return formatted address
    const formattedAddress = {
      namaAlamat: newAddress.name,
      alamatLengkap: newAddress.address,
      namaPenerima: newAddress.receiver,
      kota: newAddress.city,
      kodePos: newAddress.postalCode,
      provinsi: newAddress.province,
    };

    return NextResponse.json({ address: formattedAddress });
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update existing address
export async function PUT(request) {
  try {
    const { userId, namaAlamat, alamatLengkap, namaPenerima, kota, kodePos } =
      await request.json();

    if (
      !userId ||
      !namaAlamat ||
      !alamatLengkap ||
      !namaPenerima ||
      !kota ||
      !kodePos
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Find user with address
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        shipDetails: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.shipDetails) {
      return NextResponse.json(
        { error: "No address found to update" },
        { status: 404 }
      );
    }

    // Update existing address
    const updatedAddress = await prisma.addressDetails.update({
      where: { id: user.shipDetails.id },
      data: {
        name: namaAlamat,
        address: alamatLengkap,
        receiver: namaPenerima,
        city: kota,
        postalCode: kodePos,
      },
    });

    // Return formatted address
    const formattedAddress = {
      namaAlamat: updatedAddress.name,
      alamatLengkap: updatedAddress.address,
      namaPenerima: updatedAddress.receiver,
      kota: updatedAddress.city,
      kodePos: updatedAddress.postalCode,
      provinsi: updatedAddress.province,
    };

    return NextResponse.json({ address: formattedAddress });
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

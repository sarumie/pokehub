import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const userId = formData.get("userId");

    if (!file || !userId) {
      return NextResponse.json(
        { error: "Missing file or userId" },
        { status: 400 }
      );
    }

    // Prepare FormData for vgy.me upload
    const vgyFormData = new FormData();
    vgyFormData.append("file", file);
    // Add userkey if you have one (optional for vgy.me)
    // vgyFormData.append("userkey", "YourUserKey");

    // Upload to vgy.me
    const vgyResponse = await fetch("https://vgy.me/upload", {
      method: "POST",
      body: vgyFormData,
    });

    if (!vgyResponse.ok) {
      throw new Error("Failed to upload to vgy.me");
    }

    const vgyData = await vgyResponse.json();

    if (vgyData.error) {
      throw new Error(
        "vgy.me upload error: " + (vgyData.message || "Unknown error")
      );
    }

    // Use the "image" URL from vgy.me response
    const imageUrl = vgyData.image;

    if (!imageUrl) {
      throw new Error("No image URL returned from vgy.me");
    }

    // Update user profilePicture in DB with vgy.me URL
    await prisma.user.update({
      where: { id: userId },
      data: { profilePicture: imageUrl },
    });

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image: " + error.message },
      { status: 500 }
    );
  }
}

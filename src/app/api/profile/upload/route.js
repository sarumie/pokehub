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

    // Prepare upload data similar to PHP's CURLFile structure
    const uploadData = new FormData();
    uploadData.append("file", file);
    // userkey is left empty for now as requested
    uploadData.append(
      "userkey",
      "lHVHIWKcfI0NT6EbDG0Q7TVbOZKMrn3Rle7PkrY0NymNef9odpBFMw6wGGTv0kAd"
    );

    // Upload to vgy.me with fetch (equivalent to PHP's cURL)
    const vgyResponse = await fetch("https://vgy.me/upload", {
      method: "POST",
      body: uploadData,
    });

    if (!vgyResponse.ok) {
      throw new Error(`Failed to upload to vgy.me: ${vgyResponse.statusText}`);
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

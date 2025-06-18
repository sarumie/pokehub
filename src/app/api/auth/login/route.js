import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { retryPrismaQuery } from "@/lib/db-utils";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Find user by username with retry logic for prepared statement issues
    const user = await retryPrismaQuery(() =>
      prisma.user.findUnique({
        where: { username },
      })
    );

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Create session cookie that expires in 30 days
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const cookieStore = cookies();
    cookieStore.set({
      name: "session",
      value: user.id,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: thirtyDays,
    });

    // Return user data (excluding sensitive information)
    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      fullName: user.fullName,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

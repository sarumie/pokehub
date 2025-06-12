import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 400 }
        );
      }
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password, // Note: In a production environment, this should be hashed
      },
    });

    // Return success response without sensitive data
    return NextResponse.json({
      message: "Registration successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate inputs
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();
    const nameTrimmed = name.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (nameTrimmed.length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // Check for existing account
    const { rows: existing } = await pool.query(
      "SELECT id, auth_provider FROM users WHERE email = $1",
      [emailLower]
    );

    if (existing.length > 0) {
      const provider = existing[0].auth_provider;
      if (provider === "google") {
        return NextResponse.json(
          { error: "This email is linked to a Google account. Please sign in with Google." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 12);

    const { rows } = await pool.query(
      "INSERT INTO users (name, email, password_hash, auth_provider) VALUES ($1, $2, $3, 'local') RETURNING id, name, email",
      [nameTrimmed, emailLower, passwordHash]
    );

    return NextResponse.json({ user: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}

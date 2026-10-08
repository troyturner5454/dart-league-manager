import { NextResponse } from "next/server";

import {
  ADMIN_COOKIE_NAME,
  createAdminToken,
  verifyAdminPin,
} from "../../../../lib/adminAuth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pin = String(body.pin || "").trim();

    if (!pin) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter the admin PIN.",
        },
        {
          status: 400,
        }
      );
    }

    if (!verifyAdminPin(pin)) {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect admin PIN.",
        },
        {
          status: 401,
        }
      );
    }

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: createAdminToken(),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 4,
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "Admin login could not be processed.",
      },
      {
        status: 500,
      }
    );
  }
}
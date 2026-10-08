import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  ADMIN_COOKIE_NAME,
  verifyAdminToken,
} from "../../../../lib/adminAuth";

import {
  supabaseAdmin,
} from "../../../../lib/supabaseAdmin";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const adminToken = cookieStore.get(
      ADMIN_COOKIE_NAME
    )?.value;

    if (!verifyAdminToken(adminToken)) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin authorization required.",
        },
        {
          status: 401,
        }
      );
    }

    const {
      data: players,
      error,
    } = await supabaseAdmin
      .from("players")
      .select("id, name, team, active")
      .order("name");

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      players: players || [],
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "The player list could not be loaded.",
      },
      {
        status: 500,
      }
    );
  }
}
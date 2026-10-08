import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  ADMIN_COOKIE_NAME,
  verifyAdminToken,
} from "../../../../lib/adminAuth";

import {
  supabaseAdmin,
} from "../../../../lib/supabaseAdmin";

export async function POST(
  request: Request
) {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get(
      ADMIN_COOKIE_NAME
    )?.value;

    if (!verifyAdminToken(token)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const name = String(
      body.name || ""
    ).trim();

    const team = String(
      body.team || ""
    ).trim();

    const pin = String(
      body.pin || ""
    ).trim();

    if (!name || !pin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name and PIN are required.",
        },
        {
          status: 400,
        }
      );
    }

    const { error } =
      await supabaseAdmin
        .from("players")
        .insert({
          name,
          team,
          pin,
          active: true,
        });

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
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to create player.",
      },
      {
        status: 500,
      }
    );
  }
}
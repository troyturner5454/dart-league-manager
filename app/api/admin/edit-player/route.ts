import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  ADMIN_COOKIE_NAME,
  verifyAdminToken,
} from "../../../../lib/adminAuth";

import {
  supabaseAdmin,
} from "../../../../lib/supabaseAdmin";

export async function POST(request: Request) {
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

    const playerId = Number(body.playerId);
    const name = String(body.name || "").trim();
    const team = String(body.team || "").trim();

    if (!playerId) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid player is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Player name is required.",
        },
        {
          status: 400,
        }
      );
    }

    const { error } = await supabaseAdmin
      .from("players")
      .update({
        name,
        team,
      })
      .eq("id", playerId);

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
      message: "Player updated successfully.",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to update player.",
      },
      {
        status: 500,
      }
    );
  }
}
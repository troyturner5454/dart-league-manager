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

    const playerId = Number(
      body.playerId
    );

    const active = Boolean(
      body.active
    );

    const { error } =
      await supabaseAdmin
        .from("players")
        .update({
          active,
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
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update player.",
      },
      {
        status: 500,
      }
    );
  }
}

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

    const body = await request.json();

    const entryId = Number(body.entryId);
    const score180 = Number(body.score180);
    const score140 = Number(body.score140);
    const score171 = Number(body.score171);
    const score133 = Number(body.score133);
    const highScore = Number(body.highScore);
    const highCheckout = Number(
      body.highCheckout
    );

    if (!entryId) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid record ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(score180) ||
      !Number.isInteger(score140) ||
      !Number.isInteger(score171) ||
      !Number.isInteger(score133) ||
      score180 < 0 ||
      score140 < 0 ||
      score171 < 0 ||
      score133 < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Dart counters must be whole numbers of zero or greater.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      highScore !== 0 &&
      (highScore < 100 || highScore > 177)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "High Score must be zero or between 100 and 177.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      highCheckout !== 0 &&
      (highCheckout < 100 ||
        highCheckout > 170)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "High Checkout must be zero or between 100 and 170.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      data: updatedEntry,
      error,
    } = await supabaseAdmin
      .from("stats")
      .update({
        score180,
        score140,
        score171,
        score133,
        high_score: highScore,
        high_checkout: highCheckout,
      })
      .eq("id", entryId)
      .select("id")
      .maybeSingle();

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

    if (!updatedEntry) {
      return NextResponse.json(
        {
          success: false,
          message: "Match-history record not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Match entry updated successfully.",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "The match entry could not be updated.",
      },
      {
        status: 500,
      }
    );
  }
}
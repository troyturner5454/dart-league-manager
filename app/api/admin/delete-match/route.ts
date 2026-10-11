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

    const {
      data: deletedEntry,
      error,
    } = await supabaseAdmin
      .from("stats")
      .delete()
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

    if (!deletedEntry) {
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
      message: "Match entry deleted successfully.",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "The match entry could not be deleted.",
      },
      {
        status: 500,
      }
    );
  }
}
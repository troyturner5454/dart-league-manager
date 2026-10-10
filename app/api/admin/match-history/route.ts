import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  ADMIN_COOKIE_NAME,
  verifyAdminToken,
} from "../../../../lib/adminAuth";

import {
  supabaseAdmin,
} from "../../../../lib/supabaseAdmin";

type PlayerRow = {
  id: number;
  name: string;
};

type StatRow = {
  id: number;
  player_id: number;
  match_date: string;
  score180: number;
  score140: number;
  score171: number;
  score133: number;
  high_score: number;
  high_checkout: number;
  created_at: string;
};

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
      error: playersError,
    } = await supabaseAdmin
      .from("players")
      .select("id, name");

    if (playersError) {
      return NextResponse.json(
        {
          success: false,
          message: playersError.message,
        },
        {
          status: 500,
        }
      );
    }

    const {
      data: stats,
      error: statsError,
    } = await supabaseAdmin
      .from("stats")
      .select(
        "id, player_id, match_date, score180, score140, score171, score133, high_score, high_checkout, created_at"
      )
      .order("match_date", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      });

    if (statsError) {
      return NextResponse.json(
        {
          success: false,
          message: statsError.message,
        },
        {
          status: 500,
        }
      );
    }

    const playerNames = new Map(
      (players as PlayerRow[]).map(
        (player) => [
          player.id,
          player.name,
        ]
      )
    );

    const history = (stats as StatRow[]).map(
      (entry) => ({
        ...entry,
        player_name:
          playerNames.get(entry.player_id) ||
          "Unknown Player",
      })
    );

    return NextResponse.json({
      success: true,
      history,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "Admin match history could not be loaded.",
      },
      {
        status: 500,
      }
    );
  }
}
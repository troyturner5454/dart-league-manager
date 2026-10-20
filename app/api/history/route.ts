import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getSessionPlayerId } from "../../../lib/playerSession";

export async function GET() {
  try {

    const playerId = await getSessionPlayerId();

    if (!playerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in again.",
        },
        {
          status: 401,
        }
      );
    }

    const { data: history, error } = await supabaseAdmin
      .from("stats")
      .select(
  	"id, match_date, score180, score140, score171, score133, high_score, high_checkout, created_at"
      )
      .eq("player_id", playerId)
      .order("match_date", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
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
      history: history || [],
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Match history could not be loaded.",
      },
      {
        status: 500,
      }
    );
  }
}
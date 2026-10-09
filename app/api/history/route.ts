import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const playerId = Number(
      url.searchParams.get("playerId")
    );

    if (!playerId) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid player ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const { data: history, error } = await supabase
      .from("stats")
      .select(
        "id, match_date, score180, score140, high_score, high_checkout, created_at"
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
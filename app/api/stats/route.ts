import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const playerId = Number(body.playerId);
    const score140 = Number(body.score140);
    const score180 = Number(body.score180);
    const highScore = Number(body.highScore);
    const highCheckout = Number(body.highCheckout);

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

    if (
      score140 < 0 ||
      score180 < 0 ||
      highScore < 0 ||
      highScore > 180 ||
      highCheckout < 0 ||
      highCheckout > 170
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more stat values are invalid.",
        },
        {
          status: 400,
        }
      );
    }

    const matchDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Vancouver",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const { error } = await supabase
      .from("stats")
      .insert([
        {
          player_id: playerId,
          match_date: matchDate,
          score140: score140,
          score180: score180,
          high_score: highScore,
          high_checkout: highCheckout,
        },
      ]);

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
      message: "Tonight's stats were saved.",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "The stats could not be processed.",
      },
      {
        status: 500,
      }
    );
  }
}
import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const playerId = Number(url.searchParams.get("playerId"));

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

  const { data: stats, error } = await supabase
    .from("stats")
    .select(
      "score180, score140, score171, score133, high_score, high_checkout"
    )
    .eq("player_id", playerId);

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

  const total140s =
    stats?.reduce(
      (total, row) => total + (row.score140 || 0),
      0
    ) || 0;

  const total180s =
    stats?.reduce(
      (total, row) => total + (row.score180 || 0),
      0
    ) || 0;

  const total171s =
    stats?.reduce(
      (total, row) => total + (row.score171 || 0),
      0
    ) || 0;

  const total133s =
    stats?.reduce(
      (total, row) => total + (row.score133 || 0),
      0
    ) || 0;

  const highScore =
    stats && stats.length > 0
      ? Math.max(...stats.map((row) => row.high_score || 0))
      : 0;

  const highCheckout =
    stats && stats.length > 0
      ? Math.max(
          ...stats.map((row) => row.high_checkout || 0)
        )
      : 0;

  return NextResponse.json({
    success: true,
    stats: {
      total180s,
      total140s,
      total171s,
      total133s,
      highScore,
      highCheckout,
      matchesRecorded: stats?.length || 0,
    },
  });
}
import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

type PlayerRow = {
  id: number;
  name: string;
  team: string | null;
};

type StatRow = {
  player_id: number;
  score180: number | null;
  score140: number | null;
  score171: number | null;
  score133: number | null;
  high_score: number | null;
  high_checkout: number | null;
};

export async function GET() {
  const { data: players, error: playersError } =
    await supabase
      .from("players")
      .select("id, name, team")
      .eq("active", true)
      .order("name");

  if (playersError) {
    return NextResponse.json(
      {
        success: false,
        message: playersError.message,
      },
      { status: 500 }
    );
  }

  const { data: stats, error: statsError } =
    await supabase
      .from("stats")
      .select(
        "player_id, score180, score140, score171, score133, high_score, high_checkout"
      );

  if (statsError) {
    return NextResponse.json(
      {
        success: false,
        message: statsError.message,
      },
      { status: 500 }
    );
  }

  const leaderboard = (players as PlayerRow[]).map(
    (player) => {
      const playerStats = (stats as StatRow[]).filter(
        (stat) => stat.player_id === player.id
      );

      const total140s = playerStats.reduce(
        (total, stat) => total + (stat.score140 || 0),
        0
      );

      const total180s = playerStats.reduce(
        (total, stat) => total + (stat.score180 || 0),
        0
      );

      const total171s = playerStats.reduce(
	(total, stat) =>
    	total + (stat.score171 || 0),
  	0
      );

      const total133s = playerStats.reduce(
	(total, stat) =>
    	total + (stat.score133 || 0),
  	0
      );

      const highScore =
        playerStats.length > 0
          ? Math.max(
              ...playerStats.map(
                (stat) => stat.high_score || 0
              )
            )
          : 0;

      const highCheckout =
        playerStats.length > 0
          ? Math.max(
              ...playerStats.map(
                (stat) => stat.high_checkout || 0
              )
            )
          : 0;

      return {
  	playerId: player.id,
	name: player.name,
  	team: player.team,
  	total180s,
  	total140s,
  	total171s,
  	total133s,
  	highScore,
  	highCheckout,
      };
    }
  );

  return NextResponse.json({
    success: true,
    leaderboard,
  });
}
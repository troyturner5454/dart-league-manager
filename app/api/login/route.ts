import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function POST(request: Request) {
  const body = await request.json();

  const playerId = Number(body.playerId);
  const pin = String(body.pin || "").trim();

  if (!playerId || !pin) {
    return NextResponse.json(
      { success: false, message: "Select a player and enter a PIN." },
      { status: 400 }
    );
  }

  const { data: player, error } = await supabase
    .from("players")
    .select("id, name, team")
    .eq("id", playerId)
    .eq("pin", pin)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }

  if (!player) {
    return NextResponse.json(
      { success: false, message: "Incorrect PIN." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    player: {
      id: player.id,
      name: player.name,
      team: player.team,
    },
  });
}
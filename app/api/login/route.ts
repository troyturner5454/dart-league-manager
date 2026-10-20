import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { hashPin, isHashedPin, verifyPin } from "../../../lib/pin";
import {
  PLAYER_COOKIE_NAME,
  createPlayerSessionValue,
  playerCookieOptions,
} from "../../../lib/playerSession";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const playerId = Number(body.playerId);
    const pin = String(body.pin || "").trim();

    if (!playerId || !pin) {
      return NextResponse.json(
        { success: false, message: "Select a player and enter a PIN." },
        { status: 400 }
      );
    }

    const { data: player, error } = await supabaseAdmin
      .from("players")
      .select("id, name, team, pin, active, failed_attempts, locked_until")
      .eq("id", playerId)
      .maybeSingle();

    if (error) {
      console.error("Login database error:", error.message);
      return NextResponse.json(
        { success: false, message: "Login could not be processed." },
        { status: 500 }
      );
    }

    if (!player || !player.active) {
      return NextResponse.json(
        { success: false, message: "Incorrect PIN." },
        { status: 401 }
      );
    }

    if (player.locked_until && new Date(player.locked_until).getTime() > Date.now()) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many wrong PINs. Try again in ${LOCK_MINUTES} minutes or ask the admin.`,
        },
        { status: 429 }
      );
    }

    if (!verifyPin(pin, player.pin)) {
      const attempts = (player.failed_attempts || 0) + 1;
      const lock = attempts >= MAX_FAILED_ATTEMPTS;

      await supabaseAdmin
        .from("players")
        .update({
          failed_attempts: lock ? 0 : attempts,
          locked_until: lock
            ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString()
            : null,
        })
        .eq("id", player.id);

      return NextResponse.json(
        { success: false, message: "Incorrect PIN." },
        { status: 401 }
      );
    }

    // Correct PIN: clear the counters and upgrade an old plain-text PIN to a hash.
    const update: Record<string, unknown> = {
      failed_attempts: 0,
      locked_until: null,
    };
    if (!isHashedPin(player.pin)) update.pin = hashPin(pin);
    await supabaseAdmin.from("players").update(update).eq("id", player.id);

    const response = NextResponse.json({
      success: true,
      player: { id: player.id, name: player.name, team: player.team },
    });
    response.cookies.set({
      name: PLAYER_COOKIE_NAME,
      value: createPlayerSessionValue(player.id),
      ...playerCookieOptions,
    });
    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { success: false, message: "Login could not be processed." },
      { status: 500 }
    );
  }
}

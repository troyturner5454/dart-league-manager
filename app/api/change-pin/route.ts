import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import {
  hashPin,
  pinFormatOk,
  PIN_FORMAT_MESSAGE,
  verifyPin,
} from "../../../lib/pin";
import { getSessionPlayerId } from "../../../lib/playerSession";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export async function POST(request: Request) {
  try {
    const playerId = await getSessionPlayerId();
    if (!playerId) {
      return NextResponse.json(
        { success: false, message: "Please log in again." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const currentPin = String(body.currentPin || "").trim();
    const newPin = String(body.newPin || "").trim();

    if (!currentPin || !newPin) {
      return NextResponse.json(
        { success: false, message: "Enter your current PIN and a new PIN." },
        { status: 400 }
      );
    }

    if (!pinFormatOk(newPin)) {
      return NextResponse.json(
        { success: false, message: PIN_FORMAT_MESSAGE },
        { status: 400 }
      );
    }

    if (newPin === currentPin) {
      return NextResponse.json(
        { success: false, message: "The new PIN must be different." },
        { status: 400 }
      );
    }

    const { data: player, error } = await supabaseAdmin
      .from("players")
      .select("id, pin, active, failed_attempts, locked_until")
      .eq("id", playerId)
      .maybeSingle();

    if (error || !player || !player.active) {
      return NextResponse.json(
        { success: false, message: "Your PIN could not be changed." },
        { status: 400 }
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

    if (!verifyPin(currentPin, player.pin)) {
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
        { success: false, message: "Your current PIN is incorrect." },
        { status: 401 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("players")
      .update({
        pin: hashPin(newPin),
        failed_attempts: 0,
        locked_until: null,
      })
      .eq("id", player.id);

    if (updateError) {
      console.error("Change PIN error:", updateError.message);
      return NextResponse.json(
        { success: false, message: "Your PIN could not be changed." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Change PIN error:", err);
    return NextResponse.json(
      { success: false, message: "Your PIN could not be changed." },
      { status: 500 }
    );
  }
}

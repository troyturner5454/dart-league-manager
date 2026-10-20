import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const PLAYER_COOKIE_NAME = "league-player-session";
const SESSION_HOURS = 12;

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_SECRET environment variable is missing or too short.");
  }
  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

/** Cookie value: "<playerId>.<expiresAtMs>.<signature>" */
export function createPlayerSessionValue(playerId: number) {
  const expires = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = `${playerId}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export const playerCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_HOURS * 60 * 60,
};

/** The logged-in player's id from the signed cookie, or null. */
export async function getSessionPlayerId(): Promise<number | null> {
  const store = await cookies();
  const value = store.get(PLAYER_COOKIE_NAME)?.value;
  if (!value) return null;

  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [id, expires, signature] = parts;

  const expected = Buffer.from(sign(`${id}.${expires}`));
  const supplied = Buffer.from(signature);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
    return null;
  }
  if (!Number.isFinite(Number(expires)) || Number(expires) < Date.now()) return null;

  const playerId = Number(id);
  return Number.isInteger(playerId) && playerId > 0 ? playerId : null;
}

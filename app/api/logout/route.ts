import { NextResponse } from "next/server";
import { PLAYER_COOKIE_NAME } from "../../../lib/playerSession";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: PLAYER_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
  });
  return response;
}

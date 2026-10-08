import { supabase } from "../lib/supabase";
import DartLeagueApp from "./DartLeagueApp";

export const instant = false;

export default async function Home() {
  const { data: players, error } = await supabase
    .from("players")
    .select("id, name, team")
    .eq("active", true)
    .order("name");

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <h1 className="text-2xl font-bold">
          Database error
        </h1>

        <p className="mt-3 text-red-300">
          {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
      <DartLeagueApp players={players || []} />
    </main>
  );
}
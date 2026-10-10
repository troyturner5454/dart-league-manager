"use client";

import { useEffect, useState } from "react";

type Player = {
  playerId: number;
  name: string;
  team: string | null;
  total180s: number;
  total140s: number;
  total171s: number;
  total133s: number;
  highScore: number;
  highCheckout: number;
};

type Category =
  | "total180s"
  | "total140s"
  | "total171s"
  | "total133s"
  | "highScore"
  | "highCheckout";

type LeaderboardProps = {
  currentPlayerId: number;
  onBack: () => void;
};

export default function Leaderboard({
  currentPlayerId,
  onBack,
}: LeaderboardProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [category, setCategory] =
    useState<Category>("total180s");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadLeaderboard() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/leaderboard", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(
          result.message || "Could not load leaderboard."
        );
        return;
      }

      setPlayers(result.leaderboard);
    } catch {
      setError("Could not connect to leaderboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const sortedPlayers = [...players].sort((a, b) => {
    const difference = b[category] - a[category];

    if (difference !== 0) {
      return difference;
    }

    return a.name.localeCompare(b.name);
  });

  const labels: Record<Category, string> = {
    total140s: "180s",
    total180s: "140s",
    total171s: "171s",
    total133s: "133s",
    highScore: "High Score",
    highCheckout: "High Checkout",
  };

  function rank(index: number) {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";

    return `${index + 1}.`;
  }

  return (
    <section className="w-full max-w-lg rounded-3xl bg-slate-900 p-6 text-white shadow-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold tracking-widest text-red-500">
            LIVE STANDINGS
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Leaderboard
          </h1>
        </div>

        <div className="text-5xl">🏆</div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <CategoryButton
 	 label="Most 180s"
 	 selected={category === "total180s"}
	 onClick={() => setCategory("total180s")}
	/>

	<CategoryButton
	  label="Most 140s"
	  selected={category === "total140s"}
	  onClick={() => setCategory("total140s")}
	/>

	<CategoryButton
	  label="Most 171s"
	  selected={category === "total171s"}
	  onClick={() => setCategory("total171s")}
	/>

	<CategoryButton
	  label="Most 133s"
	  selected={category === "total133s"}
	  onClick={() => setCategory("total133s")}
	/>

        <CategoryButton
          label="High Score"
          selected={category === "highScore"}
          onClick={() => setCategory("highScore")}
        />

        <CategoryButton
          label="High Checkout"
          selected={category === "highCheckout"}
          onClick={() => setCategory("highCheckout")}
        />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {labels[category]}
        </h2>

        <button
          type="button"
          onClick={loadLeaderboard}
          className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <p className="mt-5 rounded-xl bg-slate-800 p-5 text-center">
          Loading leaderboard...
        </p>
      )}

      {error && (
        <p className="mt-5 rounded-xl bg-red-950 p-4 text-red-200">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="mt-4 space-y-3">
          {sortedPlayers.map((player, index) => {
            const isCurrentPlayer =
              player.playerId === currentPlayerId;

            return (
              <div
                key={player.playerId}
                className={
                  isCurrentPlayer
                    ? "flex items-center justify-between rounded-2xl border border-red-500 bg-red-950 p-4"
                    : "flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-800 p-4"
                }
              >
                <div className="flex items-center gap-3">
                  <span className="w-10 text-center text-xl font-bold">
                    {rank(index)}
                  </span>

                  <div>
                    <p className="font-bold">
                      {player.name}
                      {isCurrentPlayer ? " (You)" : ""}
                    </p>

                    <p className="text-sm text-slate-400">
                      {player.team || "No team"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-3xl font-bold">
                    {player[category]}
                  </p>

                  <p className="text-xs text-slate-400">
                    {labels[category]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={onBack}
        className="mt-6 w-full rounded-xl border border-slate-600 bg-slate-800 p-4 font-semibold"
      >
        Back to Dashboard
      </button>
    </section>
  );
}

function CategoryButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        selected
          ? "rounded-xl bg-red-600 p-3 font-bold"
          : "rounded-xl bg-slate-800 p-3 font-semibold text-slate-300"
      }
    >
      {label}
    </button>
  );
}
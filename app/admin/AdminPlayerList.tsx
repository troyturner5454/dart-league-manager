"use client";

import { useEffect, useState } from "react";

type Player = {
  id: number;
  name: string;
  team: string | null;
  active: boolean;
};

export default function AdminPlayerList() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPlayers() {
    try {
      const response = await fetch(
        "/api/admin/players"
      );

      const result = await response.json();

      if (result.success) {
        setPlayers(result.players);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlayers();
  }, []);

  if (loading) {
    return (
      <div className="mt-6">
        Loading players...
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="mb-4 text-xl font-bold">
        Players
      </h2>

      {players.map((player) => (
        <div
          key={player.id}
          className="mb-2 rounded-lg bg-slate-800 p-3"
        >
          <div className="font-bold">
            {player.name}
          </div>

          <div className="text-sm text-slate-400">
            Team: {player.team}
          </div>

          <div className="text-sm text-slate-400">
            Status:{" "}
            {player.active
              ? "Active"
              : "Inactive"}
          </div>
        </div>
      ))}
    </div>
  );
}
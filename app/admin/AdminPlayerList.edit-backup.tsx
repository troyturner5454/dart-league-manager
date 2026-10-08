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
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");

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
async function resetPin(
  playerId: number,
  playerName: string
) {
  const newPin = prompt(
    `Enter a new PIN for ${playerName}`
  );

  if (!newPin) {
    return;
  }

  try {
    const response = await fetch(
      "/api/admin/reset-pin",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          playerId,
          pin: newPin,
        }),
      }
    );

    const result =
      await response.json();

    if (!result.success) {
      alert(
        result.message ||
          "Unable to reset PIN."
      );
      return;
    }

    alert(
      `${playerName}'s PIN was updated successfully.`
    );
  } catch {
    alert("Unable to reset PIN.");
  }
}
async function togglePlayer(
  playerId: number,
  active: boolean
) {
  try {
    const response = await fetch(
      "/api/admin/toggle-player",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId,
          active: !active,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      alert(
        result.message ||
          "Unable to update player."
      );
      return;
    }

    await loadPlayers();
  } catch {
    alert("Unable to update player.");
  }
}
async function createPlayer() {
  setMessage("");

  try {
    const response = await fetch(
      "/api/admin/add-player",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          name,
          team,
          pin,
        }),
      }
    );

    const result =
      await response.json();

    if (!result.success) {
      setMessage(
        result.message ||
          "Unable to create player."
      );
      return;
    }

    setName("");
    setTeam("");
    setPin("");

    await loadPlayers();

    setMessage(
      "Player created successfully."
    );
  } catch {
    setMessage(
      "Unable to create player."
    );
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
  Add Player
</h2>

<input
  value={name}
  onChange={(e) =>
    setName(e.target.value)
  }
  placeholder="Player Name"
  className="mb-2 w-full rounded-lg bg-slate-700 p-3"
/>

<input
  value={team}
  onChange={(e) =>
    setTeam(e.target.value)
  }
  placeholder="Team"
  className="mb-2 w-full rounded-lg bg-slate-700 p-3"
/>

<input
  value={pin}
  onChange={(e) =>
    setPin(e.target.value)
  }
  placeholder="PIN"
  className="mb-3 w-full rounded-lg bg-slate-700 p-3"
/>

<button
  onClick={createPlayer}
  className="mb-4 w-full rounded-lg bg-red-600 p-3 font-bold"
>
  Create Player
</button>

{message && (
  <div className="mb-4 rounded-lg bg-slate-700 p-3">
    {message}
  </div>
)}

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
	  <div className="mt-3 flex flex-wrap gap-2">
  <button
    type="button"
    onClick={() =>
      resetPin(
        player.id,
        player.name
      )
    }
    className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold"
  >
    Reset PIN
  </button>

  <button
    type="button"
    onClick={() =>
      togglePlayer(
        player.id,
        player.active
      )
    }
    className={
      player.active
        ? "rounded-lg bg-yellow-600 px-3 py-2 text-sm font-bold"
        : "rounded-lg bg-green-600 px-3 py-2 text-sm font-bold"
    }
  >
    {player.active
      ? "Deactivate"
      : "Activate"}
  </button>
</div>
        </div>
      ))}
    </div>
  );
}
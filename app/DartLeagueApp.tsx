"use client";

import { FormEvent, useState } from "react";
import Leaderboard from "./Leaderboard";
import MatchHistory from "./MatchHistory";

type Player = {
  id: number;
  name: string;
  team: string | null;
};

type PlayerStats = {
  total180s: number;
  total140s: number;
  total171s: number;
  total133s: number;
  highScore: number;
  highCheckout: number;
  matchesRecorded: number;
};

type DartLeagueAppProps = {
  players: Player[];
};

const emptyStats: PlayerStats = {
  total180s: 0,
  total140s: 0,
  total171s: 0,
  total133s: 0,
  highScore: 0,
  highCheckout: 0,
  matchesRecorded: 0,
};

export default function DartLeagueApp({
  players,
}: DartLeagueAppProps) {
  const [selectedPlayerId, setSelectedPlayerId] =
    useState("");

  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");

  const [loggedInPlayer, setLoggedInPlayer] =
    useState<Player | null>(null);

  const [playerStats, setPlayerStats] =
    useState<PlayerStats>(emptyStats);

  const [screen, setScreen] = useState<
    | "login"
    | "dashboard"
    | "entry"
    | "leaderboard"
    | "history"
  >("login");

  const [score180, setScore180] = useState(0);
  const [score140, setScore140] = useState(0);
  const [score171, setScore171] = useState(0);
  const [score133, setScore133] = useState(0);
  const [highScore, setHighScore] = useState("");
  const [highCheckout, setHighCheckout] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadDashboardStats(playerId: number) {
    const response = await fetch(
      `/api/dashboard?playerId=${playerId}`
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      setMessage(
        result.message || "Could not load player statistics."
      );

      setPlayerStats(emptyStats);
      return;
    }

    setPlayerStats(result.stats);
  }

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setMessage("");

    if (!selectedPlayerId) {
      setMessage("Please select your name.");
      return;
    }

    if (!pin) {
      setMessage("Please enter your PIN.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId: selectedPlayerId,
          pin,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setMessage(result.message || "Login failed.");
        return;
      }

      setLoggedInPlayer(result.player);
      setPin("");

      await loadDashboardStats(result.player.id);

      setScreen("dashboard");
    } catch {
      setMessage("Could not connect to the login service.");
    } finally {
      setLoading(false);
    }
  }

  function openStatEntry() {
    setScore180(0);
    setScore140(0);
    setScore171(0);
    setScore133(0);
    setHighScore("");
    setHighCheckout("");
    setMessage("");
    setScreen("entry");
  }

  async function saveStats() {
    if (!loggedInPlayer) {
      return;
    }

    const numericHighScore = Number(highScore || 0);
    const numericHighCheckout = Number(highCheckout || 0);

    if (
  	numericHighScore !== 0 &&
  	(numericHighScore < 101 ||
    	  numericHighScore > 177)
    ) {
      setMessage(
        "High Score must be between 101 and 177."
      );
      return;
    }

    if (
      numericHighCheckout !== 0 &&
      (numericHighCheckout < 100 ||
        numericHighCheckout > 170)
    ) {
      setMessage(
        "High Checkout must be between 100 and 170."
      );
      return;
    }

    if (
      score180 === 0 &&
      score140 === 0 &&
      score171 === 0 &&
      score133 === 0 &&
      numericHighScore === 0 &&
      numericHighCheckout === 0
    ) {
      setMessage(
        "Enter at least one statistic before saving."
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
	  playerId: loggedInPlayer.id,
	  score180,
	  score140,
	  score171,
	  score133,
	  highScore: numericHighScore,
	  highCheckout: numericHighCheckout,
	}),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setMessage(
          result.message || "The stats could not be saved."
        );
        return;
      }

      await loadDashboardStats(loggedInPlayer.id);

      setScore180(0);
      setScore140(0);
      setScore171(0);
      setScore133(0);
      setHighScore("");
      setHighCheckout("");

      setScreen("dashboard");
      setMessage("Tonight's stats were saved successfully.");
    } catch {
      setMessage("Could not connect to the stats service.");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    setLoggedInPlayer(null);
    setSelectedPlayerId("");
    setPin("");
    setMessage("");
    setPlayerStats(emptyStats);
    setScreen("login");
  }

  if (screen === "login") {
    return (
      <section className="w-full max-w-md rounded-3xl bg-slate-900 p-8 text-white shadow-2xl">
        <div className="mb-3 text-center text-6xl">
          🎯
        </div>

        <h1 className="text-center text-3xl font-bold">
          CR Wed Darts
        </h1>

        <p className="mt-2 text-center text-slate-400">
          Select your name and enter your PIN
        </p>

        <form onSubmit={handleLogin} className="mt-8">
          <label
            htmlFor="player"
            className="mb-2 block font-semibold"
          >
            Player
          </label>

          <select
            id="player"
            value={selectedPlayerId}
            onChange={(event) => {
              setSelectedPlayerId(event.target.value);
              setMessage("");
            }}
            className="w-full rounded-xl border border-slate-600 bg-slate-800 p-4 text-lg"
          >
            <option value="">Select your name</option>

            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>

          <label
            htmlFor="pin"
            className="mb-2 mt-5 block font-semibold"
          >
            PIN
          </label>

          <input
            id="pin"
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(event) => {
              setPin(event.target.value);
              setMessage("");
            }}
            placeholder="Enter your PIN"
            className="w-full rounded-xl border border-slate-600 bg-slate-800 p-4 text-lg"
          />

          {message && (
            <div className="mt-4 rounded-xl bg-red-950 p-3 text-red-200">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-red-600 p-4 text-lg font-bold hover:bg-red-500"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </section>
    );
  }

  if (screen === "entry" && loggedInPlayer) {
    return (
      <section className="w-full max-w-lg rounded-3xl bg-slate-900 p-7 text-white shadow-2xl">
        <p className="text-sm font-bold tracking-widest text-red-500">
          TONIGHT&apos;S MATCH
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Enter Stats
        </h1>

        <p className="mt-1 text-slate-400">
          Player: {loggedInPlayer.name}
        </p>
	
	<div className="mt-7 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-800 p-4">

  <p className="text-center text-lg font-semibold">
    180s
  </p>

  <div className="mt-4 flex items-center justify-between">
    <button
      type="button"
      onClick={() =>
        setScore180(Math.max(0, score180 - 1))
      }
      className="h-12 w-12 rounded-xl bg-slate-700 text-2xl font-bold"
    >
      −
    </button>

    <span className="text-3xl font-bold">
      {score180}
    </span>

    <button
      type="button"
      onClick={() => setScore180(score180 + 1)}
      className="h-12 w-12 rounded-xl bg-red-600 text-2xl font-bold"
    >
      +
    </button>
  </div>
</div>

<div className="rounded-2xl bg-slate-800 p-4">
  <p className="text-center text-lg font-semibold">
    140s
  </p>

  <div className="mt-4 flex items-center justify-between">
    <button
      type="button"
      onClick={() =>
        setScore140(Math.max(0, score140 - 1))
      }
      className="h-12 w-12 rounded-xl bg-slate-700 text-2xl font-bold"
    >
      −
    </button>

    <span className="text-3xl font-bold">
      {score140}
    </span>

    <button
      type="button"
      onClick={() => setScore140(score140 + 1)}
      className="h-12 w-12 rounded-xl bg-red-600 text-2xl font-bold"
    >
      +
    </button>
  </div>
</div>

<div className="rounded-2xl bg-slate-800 p-4">
  <p className="text-center text-lg font-semibold">
    171s
  </p>

  <div className="mt-4 flex items-center justify-between">
    <button
      type="button"
      onClick={() =>
        setScore171(Math.max(0, score171 - 1))
      }
      className="h-12 w-12 rounded-xl bg-slate-700 text-2xl font-bold"
    >
      −
    </button>

    <span className="text-3xl font-bold">
      {score171}
    </span>

    <button
      type="button"
      onClick={() =>
        setScore171(score171 + 1)
      }
      className="h-12 w-12 rounded-xl bg-red-600 text-2xl font-bold"
    >
      +
    </button>
  </div>
</div>

<div className="rounded-2xl bg-slate-800 p-4">
  <p className="text-center text-lg font-semibold">
    133s
  </p>

  <div className="mt-4 flex items-center justify-between">
    <button
      type="button"
      onClick={() =>
        setScore133(Math.max(0, score133 - 1))
      }
      className="h-12 w-12 rounded-xl bg-slate-700 text-2xl font-bold"
    >
      −
    </button>

    <span className="text-3xl font-bold">
      {score133}
    </span>

    <button
      type="button"
      onClick={() =>
        setScore133(score133 + 1)
      }
      className="h-12 w-12 rounded-xl bg-red-600 text-2xl font-bold"
    >
      +
    </button>
  </div>
</div>
</div>
        <label className="mb-2 mt-5 block font-semibold">
          High Score (100-177)
        </label>

        <input
          type="number"
          min="100"
          max="177"
          inputMode="numeric"
          value={highScore}
          onChange={(event) =>
            setHighScore(event.target.value)
          }
          placeholder="Example: 177"
          className="w-full rounded-xl border border-slate-600 bg-slate-800 p-4 text-xl"
        />

        <label className="mb-2 mt-5 block font-semibold">
          High Checkout (100-170)
        </label>

        <input
          type="number"
          min="100"
          max="170"
          inputMode="numeric"
          value={highCheckout}
          onChange={(event) =>
            setHighCheckout(event.target.value)
          }
          placeholder="Example: 112"
          className="w-full rounded-xl border border-slate-600 bg-slate-800 p-4 text-xl"
        />

        {message && (
          <div className="mt-4 rounded-xl bg-blue-950 p-3 text-blue-200">
            {message}
          </div>
        )}

        <button
          type="button"
          disabled={saving}
          onClick={saveStats}
          className="mt-6 w-full rounded-xl bg-red-600 p-4 text-lg font-bold hover:bg-red-500"
        >
          {saving ? "Saving..." : "Save Tonight's Stats"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMessage("");
            setScreen("dashboard");
          }}
          className="mt-3 w-full rounded-xl border border-slate-600 bg-slate-800 p-4 font-semibold"
        >
          Back to Dashboard
        </button>
      </section>
    );
  }

if (
  screen === "leaderboard" &&
  loggedInPlayer
) {
  return (
    <Leaderboard
      currentPlayerId={loggedInPlayer.id}
      onBack={() => {
        setMessage("");
        setScreen("dashboard");
      }}
    />
  );
}

if (
  screen === "history" &&
  loggedInPlayer
) {
  return (
    <MatchHistory
      playerId={loggedInPlayer.id}
      playerName={loggedInPlayer.name}
      onBack={() => {
        setMessage("");
        setScreen("dashboard");
      }}
    />
  );
}

  if (!loggedInPlayer) {
    return null;
  }

  return (
    <section className="w-full max-w-lg rounded-3xl bg-slate-900 p-7 text-white shadow-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold tracking-widest text-red-500">
            CR WED DARTS
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Welcome, {loggedInPlayer.name}
          </h1>

          <p className="mt-1 text-slate-400">
            Team: {loggedInPlayer.team || "No team"}
          </p>
        </div>

        <div className="text-6xl">🎯</div>
      </div>

      <h2 className="mt-8 text-xl font-bold">
        Season Statistics
      </h2>

      <div className="mt-4 grid grid-cols-2 gap-3">
  	<StatCard
    	  value={playerStats.total180s}
    	  label="180s"
  	/>

  	<StatCard
    	  value={playerStats.total140s}
    	  label="140s"
  	/>

  	<StatCard
    	  value={playerStats.total171s}
    	  label="171s"
  	/>

  	<StatCard
    	  value={playerStats.total133s}
    	  label="133s"
  	/>

  	<StatCard
    	  value={playerStats.highScore}
    	  label="High Score"
  	/>

  	<StatCard
    	  value={playerStats.highCheckout}
    	  label="High Checkout"
  	/>
      </div>

      <div className="mt-4 flex justify-between rounded-xl bg-slate-950 p-4 text-slate-300">
        <span>Match nights recorded</span>
        <strong>{playerStats.matchesRecorded}</strong>
      </div>

      {message && (
        <div className="mt-4 rounded-xl bg-green-950 p-3 text-green-200">
          {message}
        </div>
      )}

      <button
        type="button"
        onClick={openStatEntry}
        className="mt-6 w-full rounded-xl bg-red-600 p-4 text-lg font-bold hover:bg-red-500"
      >
        Enter Tonight&apos;s Stats
      </button>

      <button
  	type="button"
  	onClick={() => {
    	  setMessage("");
    	  setScreen("leaderboard");
  	}}
        className="mt-3 w-full rounded-xl border border-slate-600 bg-slate-800 p-4 font-semibold"
      >
        View Leaderboard
      </button>

	<button
	  type="button"
	  onClick={() => {
	    setMessage("");
	    setScreen("history");
	  }}
	  className="mt-3 w-full rounded-xl border border-slate-600 bg-slate-800 p-4 font-semibold"
	>
	  View Match History
	</button>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-3 w-full p-3 text-slate-400"
      >
        Log Out
      </button>
    </section>
  );
}

function StatCard({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 text-center">
      <p className="text-4xl font-bold">{value}</p>

      <p className="mt-2 text-sm text-slate-400">
        {label}
      </p>
    </div>
  );
}
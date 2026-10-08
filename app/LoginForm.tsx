"use client";

import {
  FormEvent,
  useState,
} from "react";

type Player = {
  id: number;
  name: string;
  team: string | null;
};

type PlayerStats = {
  total140s: number;
  total180s: number;
  highScore: number;
  highCheckout: number;
  matchesRecorded: number;
};

type LoginFormProps = {
  players: Player[];
};

const emptyStats: PlayerStats = {
  total140s: 0,
  total180s: 0,
  highScore: 0,
  highCheckout: 0,
  matchesRecorded: 0,
};

export default function LoginForm({
  players,
}: LoginFormProps) {
  const [playerId, setPlayerId] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");

  const [loggedInPlayer, setLoggedInPlayer] =
    useState<Player | null>(null);

  const [playerStats, setPlayerStats] =
    useState<PlayerStats>(emptyStats);

  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] =
    useState(false);

  async function loadDashboardStats(
    selectedPlayerId: number
  ) {
    setDashboardLoading(true);

    try {
      const response = await fetch(
        `/api/dashboard?playerId=${selectedPlayerId}`
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
    } catch {
      setMessage("Could not connect to the dashboard service.");
      setPlayerStats(emptyStats);
    } finally {
      setDashboardLoading(false);
    }
  }

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");

    if (!playerId) {
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
          playerId,
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
    } catch {
      setMessage("Could not connect to the login service.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setLoggedInPlayer(null);
    setPlayerId("");
    setPin("");
    setMessage("");
    setPlayerStats(emptyStats);
  }

  function handleEnterStats() {
    setMessage(
      "The Enter Stats screen will be built next."
    );
  }

  function handleLeaderboard() {
    setMessage(
      "The leaderboard screen will be built after stat entry."
    );
  }

  if (loggedInPlayer) {
    return (
      <section style={styles.dashboard}>
        <div style={styles.dashboardHeader}>
          <div>
            <p style={styles.smallLabel}>
              TCS DART LEAGUE
            </p>

            <h1 style={styles.welcomeHeading}>
              Welcome, {loggedInPlayer.name}
            </h1>

            <p style={styles.teamText}>
              Team:{" "}
              {loggedInPlayer.team || "No team assigned"}
            </p>
          </div>

          <div style={styles.target}>🎯</div>
        </div>

        {dashboardLoading ? (
          <div style={styles.loadingBox}>
            Loading your statistics...
          </div>
        ) : (
          <>
            <h2 style={styles.sectionHeading}>
              Season Statistics
            </h2>

            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <p style={styles.statNumber}>
                  {playerStats.total140s}
                </p>

                <p style={styles.statLabel}>
                  140s
                </p>
              </div>

              <div style={styles.statCard}>
                <p style={styles.statNumber}>
                  {playerStats.total180s}
                </p>

                <p style={styles.statLabel}>
                  180s
                </p>
              </div>

              <div style={styles.statCard}>
                <p style={styles.statNumber}>
                  {playerStats.highScore}
                </p>

                <p style={styles.statLabel}>
                  High Score
                </p>
              </div>

              <div style={styles.statCard}>
                <p style={styles.statNumber}>
                  {playerStats.highCheckout}
                </p>

                <p style={styles.statLabel}>
                  High Checkout
                </p>
              </div>
            </div>

            <div style={styles.matchBox}>
              <span>Match nights recorded</span>

              <strong>
                {playerStats.matchesRecorded}
              </strong>
            </div>
          </>
        )}

        {message && (
          <div style={styles.messageBox}>
            {message}
          </div>
        )}

        <button
          type="button"
          onClick={handleEnterStats}
          style={styles.primaryButton}
        >
          Enter Tonight&apos;s Stats
        </button>

        <button
          type="button"
          onClick={handleLeaderboard}
          style={styles.leaderboardButton}
        >
          View Leaderboard
        </button>

        <button
          type="button"
          onClick={handleLogout}
          style={styles.logoutButton}
        >
          Log Out
        </button>
      </section>
    );
  }

  return (
    <section style={styles.loginCard}>
      <div style={styles.loginTarget}>🎯</div>

      <h1 style={styles.loginHeading}>
        TCS Dart League
      </h1>

      <p style={styles.loginDescription}>
        Select your name and enter your PIN
      </p>

      <form onSubmit={handleLogin}>
        <label
          htmlFor="player"
          style={styles.label}
        >
          Player
        </label>

        <select
          id="player"
          value={playerId}
          onChange={(event) => {
            setPlayerId(event.target.value);
            setMessage("");
          }}
          style={styles.input}
        >
          <option value="">
            Select your name
          </option>

          {players.map((player) => (
            <option
              key={player.id}
              value={player.id}
            >
              {player.name}
            </option>
          ))}
        </select>

        <label
          htmlFor="pin"
          style={styles.label}
        >
          PIN
        </label>

        <input
          id="pin"
          type="password"
          inputMode="numeric"
          maxLength={10}
          value={pin}
          onChange={(event) => {
            setPin(event.target.value);
            setMessage("");
          }}
          placeholder="Enter your PIN"
          style={styles.input}
        />

        {message && (
          <div style={styles.errorBox}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={styles.loginButton}
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </section>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  loginCard: {
    boxSizing: "border-box",
    width: "100%",
    maxWidth: "420px",
    padding: "32px",
    borderRadius: "20px",
    backgroundColor: "#111827",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
  },

  loginTarget: {
    fontSize: "54px",
    textAlign: "center",
    marginBottom: "10px",
  },

  loginHeading: {
    margin: "0",
    color: "#ffffff",
    fontSize: "30px",
    textAlign: "center",
  },

  loginDescription: {
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: "28px",
  },

  label: {
    display: "block",
    color: "#e5e7eb",
    fontWeight: "bold",
    marginTop: "18px",
    marginBottom: "8px",
  },

  input: {
    boxSizing: "border-box",
    width: "100%",
    padding: "14px",
    border: "1px solid #374151",
    borderRadius: "10px",
    backgroundColor: "#1f2937",
    color: "#ffffff",
    fontSize: "17px",
  },

  loginButton: {
    width: "100%",
    marginTop: "24px",
    padding: "15px",
    border: "none",
    borderRadius: "10px",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  errorBox: {
    marginTop: "16px",
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#7f1d1d",
    color: "#fecaca",
  },

  dashboard: {
    boxSizing: "border-box",
    width: "100%",
    maxWidth: "520px",
    padding: "28px",
    borderRadius: "22px",
    backgroundColor: "#111827",
    color: "#ffffff",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
  },

  dashboardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "28px",
  },

  smallLabel: {
    margin: "0 0 7px 0",
    color: "#ef4444",
    fontSize: "12px",
    fontWeight: "bold",
    letterSpacing: "2px",
  },

  welcomeHeading: {
    margin: "0",
    fontSize: "28px",
  },

  teamText: {
    margin: "7px 0 0 0",
    color: "#9ca3af",
  },

  target: {
    fontSize: "52px",
  },

  sectionHeading: {
    marginBottom: "14px",
    fontSize: "19px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  },

  statCard: {
    padding: "18px",
    border: "1px solid #374151",
    borderRadius: "14px",
    backgroundColor: "#1f2937",
    textAlign: "center",
  },

  statNumber: {
    margin: "0",
    color: "#ffffff",
    fontSize: "32px",
    fontWeight: "bold",
  },

  statLabel: {
    margin: "6px 0 0 0",
    color: "#9ca3af",
    fontSize: "14px",
  },

  matchBox: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "15px",
    padding: "14px",
    borderRadius: "10px",
    backgroundColor: "#0f172a",
    color: "#d1d5db",
  },

  loadingBox: {
    padding: "26px",
    borderRadius: "12px",
    backgroundColor: "#1f2937",
    color: "#d1d5db",
    textAlign: "center",
  },

  messageBox: {
    marginTop: "16px",
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#1e3a8a",
    color: "#dbeafe",
  },

  primaryButton: {
    width: "100%",
    marginTop: "24px",
    padding: "15px",
    border: "none",
    borderRadius: "10px",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    fontSize: "17px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  leaderboardButton: {
    width: "100%",
    marginTop: "12px",
    padding: "14px",
    border: "1px solid #4b5563",
    borderRadius: "10px",
    backgroundColor: "#1f2937",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  logoutButton: {
    width: "100%",
    marginTop: "12px",
    padding: "12px",
    border: "none",
    backgroundColor: "transparent",
    color: "#9ca3af",
    fontSize: "15px",
    cursor: "pointer",
  },
};
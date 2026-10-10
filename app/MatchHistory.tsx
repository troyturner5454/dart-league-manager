"use client";

import { useEffect, useState } from "react";

type HistoryEntry = {
  id: number;
  match_date: string;
  score180: number;
  score140: number;
  score171: number;
  score133: number;
  high_score: number;
  high_checkout: number;
  created_at: string;
};

type MatchHistoryProps = {
  playerId: number;
  playerName: string;
  onBack: () => void;
};

export default function MatchHistory({
  playerId,
  playerName,
  onBack,
}: MatchHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadHistory() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/history?playerId=${playerId}`,
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setMessage(
          result.message ||
            "Match history could not be loaded."
        );
        return;
      }

      setHistory(result.history || []);
    } catch {
      setMessage(
        "Could not connect to the match history service."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, [playerId]);

  function formatDate(dateValue: string) {
    const date = new Date(
      `${dateValue}T12:00:00`
    );

    return date.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <section className="w-full max-w-lg rounded-3xl bg-slate-900 p-6 text-white shadow-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold tracking-widest text-red-500">
            CR WED DARTS
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Match History
          </h1>

          <p className="mt-1 text-slate-400">
            Player: {playerName}
          </p>
        </div>

        <div className="text-5xl">
          📋
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {history.length} match nights recorded
        </p>

        <button
          type="button"
          onClick={loadHistory}
          className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-semibold"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="mt-5 rounded-xl bg-slate-800 p-5 text-center text-slate-300">
          Loading match history...
        </div>
      )}

      {message && (
        <div className="mt-5 rounded-xl bg-red-950 p-4 text-red-200">
          {message}
        </div>
      )}

      {!loading &&
        !message &&
        history.length === 0 && (
          <div className="mt-5 rounded-xl bg-slate-800 p-5 text-center text-slate-300">
            No match-night statistics have been
            recorded yet.
          </div>
        )}

      {!loading &&
        !message &&
        history.length > 0 && (
          <div className="mt-5 space-y-4">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl border border-slate-700 bg-slate-800 p-5"
              >
                <h2 className="text-lg font-bold">
                  {formatDate(entry.match_date)}
                </h2>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <HistoryStat
                    label="180s"
                    value={entry.score180}
                  />

                  <HistoryStat
                    label="140s"
                    value={entry.score140}
                  />

		  <HistoryStat
		  label="171s"
		  value={entry.score171}
		  />

		  <HistoryStat
		  label="133s"
		  value={entry.score133}
		  />

                  <HistoryStat
                    label="High Score"
                    value={entry.high_score}
                  />

                  <HistoryStat
                    label="High Checkout"
                    value={entry.high_checkout}
                  />
                </div>
              </div>
            ))}
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

function HistoryStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-slate-950 p-3 text-center">
      <p className="text-2xl font-bold">
        {value || 0}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {label}
      </p>
    </div>
  );
}
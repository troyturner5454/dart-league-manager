"use client";
import { useEffect, useState } from "react";
type HistoryEntry = {
  id: number;
  player_id: number;
  player_name: string;
  match_date: string;
  score180: number;
  score140: number;
  score171: number;
  score133: number;
  high_score: number;
  high_checkout: number;
  created_at: string;
};
export default function AdminMatchHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  async function loadHistory() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/match-history", {
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setMessage(
          result.message || "Admin match history could not be loaded.",
        );
        return;
      }
      setHistory(result.history || []);
    } catch {
      setMessage("Could not connect to match history.");
    } finally {
      setLoading(false);
    }
  }

  async function editEntry(entry: HistoryEntry) {
    const score180 = prompt("Enter 180s:", String(entry.score180));
    if (score180 === null) return;

    const score140 = prompt("Enter 140s:", String(entry.score140));
    if (score140 === null) return;

    const score171 = prompt("Enter 171s:", String(entry.score171));
    if (score171 === null) return;

    const score133 = prompt("Enter 133s:", String(entry.score133));
    if (score133 === null) return;

    const highScore = prompt("Enter High Score:", String(entry.high_score));
    if (highScore === null) return;

    const highCheckout = prompt(
      "Enter High Checkout:",
      String(entry.high_checkout),
    );
    if (highCheckout === null) return;

    try {
      const response = await fetch("/api/admin/edit-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entryId: entry.id,
          score180: Number(score180),
          score140: Number(score140),
          score171: Number(score171),
          score133: Number(score133),
          highScore: Number(highScore),
          highCheckout: Number(highCheckout),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.message || "Unable to update match entry.");
        return;
      }

      await loadHistory();
      alert("Match entry updated successfully.");
    } catch {
      alert("Unable to update match entry.");
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);
  function formatDate(dateValue: string) {
    const date = new Date(`${dateValue}T12:00:00`);
    return date.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return (
    <div id="match-history" className="mt-6 scroll-mt-4">
      {" "}
      <div className="flex items-center justify-between">
        {" "}
        <div>
          {" "}
          <h2 className="text-xl font-bold"> Match History </h2>{" "}
          <p className="mt-1 text-sm text-slate-400">
            {" "}
            {history.length} nightly records{" "}
          </p>{" "}
        </div>{" "}
        <button
          type="button"
          onClick={loadHistory}
          className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold"
        >
          {" "}
          Refresh{" "}
        </button>{" "}
      </div>{" "}
      {loading && (
        <div className="mt-4 rounded-xl bg-slate-800 p-5 text-center">
          {" "}
          Loading match history...{" "}
        </div>
      )}{" "}
      {message && (
        <div className="mt-4 rounded-xl bg-red-950 p-4 text-red-200">
          {" "}
          {message}{" "}
        </div>
      )}{" "}
      {!loading && !message && history.length === 0 && (
        <div className="mt-4 rounded-xl bg-slate-800 p-5 text-center text-slate-300">
          {" "}
          No match history was found.{" "}
        </div>
      )}{" "}
      {!loading && !message && history.length > 0 && (
        <div className="mt-4 space-y-4">
          {" "}
          {history.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl border border-slate-700 bg-slate-800 p-4"
            >
              {" "}
              <div className="flex items-start justify-between gap-3">
                {" "}
                <div>
                  {" "}
                  <p className="text-lg font-bold">
                    {" "}
                    {entry.player_name}{" "}
                  </p>{" "}
                  <p className="text-sm text-slate-400">
                    {" "}
                    {formatDate(entry.match_date)}{" "}
                  </p>{" "}
                </div>{" "}
                <span className="rounded-full bg-slate-950 px-3 py-1 text-xs text-slate-300">
                  {" "}
                  ID {entry.id}{" "}
                </span>{" "}
              </div>{" "}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {" "}
                <HistoryValue label="180s" value={entry.score180} />{" "}
                <HistoryValue label="140s" value={entry.score140} />{" "}
                <HistoryValue label="171s" value={entry.score171} />{" "}
                <HistoryValue label="133s" value={entry.score133} />{" "}
                <HistoryValue label="High Score" value={entry.high_score} />{" "}
                <HistoryValue
                  label="High Checkout"
                  value={entry.high_checkout}
                />{" "}
              </div>{" "}
              <button
                type="button"
                onClick={() => editEntry(entry)}
                className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-3 font-bold"
              >
                Edit Entry
              </button>
            </div>
          ))}{" "}
        </div>
      )}{" "}
    </div>
  );
}
function HistoryValue({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-950 p-3 text-center">
      {" "}
      <p className="text-2xl font-bold"> {value || 0} </p>{" "}
      <p className="mt-1 text-xs text-slate-400"> {label} </p>{" "}
    </div>
  );
}

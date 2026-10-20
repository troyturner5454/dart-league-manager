"use client";

import { FormEvent, useState } from "react";

type ChangePinProps = {
  playerName: string;
  onBack: (message?: string) => void;
};

export default function ChangePin({ playerName, onBack }: ChangePinProps) {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!currentPin || !newPin) {
      setError("Enter your current PIN and a new PIN.");
      return;
    }
    if (newPin !== confirmPin) {
      setError("The new PINs do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/change-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPin, newPin }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Your PIN could not be changed.");
        return;
      }
      onBack("Your PIN was changed.");
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-600 bg-slate-800 p-4 text-lg text-white";

  return (
    <section className="w-full max-w-lg rounded-3xl bg-slate-900 p-6 text-white shadow-2xl">
      <h1 className="text-3xl font-bold">Change PIN</h1>
      <p className="mt-1 text-slate-400">Player: {playerName}</p>

      <form onSubmit={handleSubmit} className="mt-6">
        <label htmlFor="currentPin" className="block font-semibold">
          Current PIN
        </label>
        <input
          id="currentPin"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          value={currentPin}
          onChange={(e) => setCurrentPin(e.target.value)}
          className={inputClass}
        />

        <label htmlFor="newPin" className="mt-5 block font-semibold">
          New PIN (4 to 20 characters)
        </label>
        <input
          id="newPin"
          type="password"
          inputMode="numeric"
          autoComplete="new-password"
          value={newPin}
          onChange={(e) => setNewPin(e.target.value)}
          className={inputClass}
        />

        <label htmlFor="confirmPin" className="mt-5 block font-semibold">
          Confirm new PIN
        </label>
        <input
          id="confirmPin"
          type="password"
          inputMode="numeric"
          autoComplete="new-password"
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value)}
          className={inputClass}
        />

        {error && (
          <div className="mt-4 rounded-xl bg-red-950 p-3 text-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-red-600 p-4 text-lg font-bold hover:bg-red-500 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save New PIN"}
        </button>

        <button
          type="button"
          onClick={() => onBack()}
          className="mt-3 w-full p-3 text-slate-400"
        >
          Cancel
        </button>
      </form>
    </section>
  );
}

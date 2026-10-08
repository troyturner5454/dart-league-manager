"use client";

import { FormEvent, useState } from "react";
import AdminPlayerList from "./AdminPlayerList";

export default function AdminLogin() {
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pin }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setMessage(
          result.message || "Admin login failed."
        );
        return;
      }

      setPin("");
      setLoggedIn(true);
    } catch {
      setMessage(
        "Could not connect to the admin login service."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    setLoggedIn(false);
    setPin("");
    setMessage("");
  }

  function returnToLeague() {
    window.location.href = "/";
  }

  if (loggedIn) {
    return (
      <section className="w-full max-w-lg rounded-3xl bg-slate-900 p-7 text-white shadow-2xl">
        <p className="text-sm font-bold tracking-widest text-red-500">
          CR WED DARTS
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Admin Dashboard
        </h1>

        <div className="mt-6 rounded-2xl bg-green-950 p-5 text-green-200">
          Admin login works successfully.
        </div>

       <AdminPlayerList />

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 w-full rounded-xl border border-slate-600 bg-slate-800 p-4 font-semibold"
        >
          Admin Log Out
        </button>

        <button
          type="button"
          onClick={returnToLeague}
          className="mt-3 w-full p-3 text-slate-400"
        >
          Return to League App
        </button>
      </section>
    );
  }

  return (
    <section className="w-full max-w-md rounded-3xl bg-slate-900 p-8 text-white shadow-2xl">
      <div className="text-center text-6xl">
        🔐
      </div>

      <h1 className="mt-3 text-center text-3xl font-bold">
        CR Wed Darts Admin
      </h1>

      <p className="mt-2 text-center text-slate-400">
        Enter the private administrator PIN
      </p>

      <form onSubmit={handleLogin} className="mt-8">
        <label
          htmlFor="adminPin"
          className="mb-2 block font-semibold"
        >
          Admin PIN
        </label>

        <input
          id="adminPin"
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(event) => {
            setPin(event.target.value);
            setMessage("");
          }}
          placeholder="Enter admin PIN"
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
          className="mt-6 w-full rounded-xl bg-red-600 p-4 text-lg font-bold"
        >
          {loading ? "Signing in..." : "Admin Login"}
        </button>
      </form>

      <button
        type="button"
        onClick={returnToLeague}
        className="mt-4 w-full p-3 text-slate-400"
      >
        Return to League App
      </button>
    </section>
  );
}
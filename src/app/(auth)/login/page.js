"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { login } from "../../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const nextPath = useMemo(() => sp.get("next") || "/", [sp]);

  const [email, setEmail] = useState("owner@bcs.local");
  const [password, setPassword] = useState("Owner@12345");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace(nextPath);
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">BCS Owner</h1>
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
            Secure
          </span>
        </div>

        <p className="mt-2 text-sm text-gray-600">
          Sign in to view business oversight dashboards.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              className="mt-1 w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              className="mt-1 w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error ? (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className={
              "w-full rounded-xl px-4 py-2 font-medium text-white " +
              (loading ? "bg-gray-400" : "bg-black hover:bg-gray-900")
            }
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500">
          This console is for owners and authorized oversight only.
        </p>
      </div>
    </div>
  );
}

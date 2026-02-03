"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "../../../lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("owner@bcs.com");
  const [password, setPassword] = useState("Owner@12345");
  const [msg, setMsg] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        const me = await apiFetch("/auth/me");
        if (!alive) return;

        if (me?.user?.role?.toLowerCase() === "owner") {
          router.replace("/");
        }
      } catch {
      } finally {
        if (alive) setChecking(false);
      }
    }

    run();
    return () => (alive = false);
  }, [router]);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");

    try {
      await apiFetch("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      const me = await apiFetch("/auth/me");

      if (me?.user?.role?.toLowerCase() !== "owner") {
        setMsg("This portal is for owners only.");
        return;
      }

      router.replace("/");
    } catch (err) {
      setMsg(err?.data?.error || err.message);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        Checking session...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white rounded-xl shadow p-6 space-y-4"
      >
        <h1 className="text-xl font-semibold">Owner Login</h1>

        <input
          className="border rounded-lg px-3 py-2 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border rounded-lg px-3 py-2 w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-black text-white px-4 py-2 rounded-lg w-full">
          Login
        </button>

        {msg && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {msg}
          </div>
        )}
      </form>
    </div>
  );
}

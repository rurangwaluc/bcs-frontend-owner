"use client";

import OwnerTopbar from "./OwnerTopbar";
import { logout } from "../lib/auth";
import { useState } from "react";

export default function OwnerHeader({ user }) {
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    if (loading) return;
    setLoading(true);

    try {
      await logout();
    } catch {
      // ignore (logout is best-effort)
    } finally {
      setLoading(false);
      // IMPORTANT: hard navigation so server components re-read cookies
      window.location.href = "/login";
    }
  }

  return (
    <header className="bg-white border-b">
      <div className="px-4 md:px-6 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Owner view</div>
            <div className="text-base font-semibold">
              {user?.name || user?.email || "Owner"}
            </div>
          </div>

          <button
            onClick={onLogout}
            disabled={loading}
            className={
              "md:hidden text-sm px-3 py-2 rounded-xl border " +
              (loading ? "opacity-60" : "hover:bg-gray-50")
            }
            type="button"
          >
            {loading ? "Logging out..." : "Logout"}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-between md:justify-end w-full md:w-auto">
          <OwnerTopbar />
          <button
            onClick={onLogout}
            disabled={loading}
            className={
              "hidden md:inline-flex text-sm px-3 py-2 rounded-xl border " +
              (loading ? "opacity-60" : "hover:bg-gray-50")
            }
            type="button"
          >
            {loading ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </header>
  );
}

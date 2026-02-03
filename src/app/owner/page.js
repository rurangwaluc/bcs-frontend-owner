"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "../../lib/api";
import { useRouter } from "next/navigation";

export default function OwnerHome() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        const me = await apiFetch("/auth/me");

        if (me?.user?.role?.toLowerCase() !== "owner") {
          router.replace("/auth/login");
          return;
        }

        const res = await apiFetch("/owner/summary");
        if (alive) setSummary(res.summary || res.data?.summary);
      } catch {
        router.replace("/auth/login");
      } finally {
        if (alive) setReady(true);
      }
    }

    run();
    return () => (alive = false);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        Loading...
      </div>
    );
  }

  if (!summary) {
    return <div className="p-6">Failed to load summary</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Owner Overview</h1>
      <pre className="bg-gray-100 p-4 rounded-xl">
        {JSON.stringify(summary, null, 2)}
      </pre>
    </div>
  );
}

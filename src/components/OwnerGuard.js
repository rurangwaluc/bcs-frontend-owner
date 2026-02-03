"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "../lib/api";
import { useRouter } from "next/navigation";

export default function OwnerGuard({ children }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const me = await apiFetch("/auth/me");
        const role = String(me?.user?.role || "").toLowerCase();

        if (role !== "owner") {
          router.replace("/auth/login");
          return;
        }

        setOk(true);
      } catch {
        router.replace("/auth/login");
      }
    }
    check();
  }, [router]);

  if (!ok) return null;

  return children;
}

"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function useGlobalFilters() {
  const sp = useSearchParams();

  return useMemo(() => {
    const range = sp.get("range") || "7d";
    const from = sp.get("from") || "";
    const to = sp.get("to") || "";
    const locationId = sp.get("locationId") || "";
    return { range, from, to, locationId };
  }, [sp]);
}

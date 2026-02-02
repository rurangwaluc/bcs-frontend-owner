"use client";

import { createContext, useContext, useMemo } from "react";

const OwnerContext = createContext(null);

export function OwnerProvider({ children, locations }) {
  const value = useMemo(() => ({ locations: locations || [] }), [locations]);
  return <OwnerContext.Provider value={value}>{children}</OwnerContext.Provider>;
}

export function useOwner() {
  const ctx = useContext(OwnerContext);
  if (!ctx) throw new Error("useOwner must be used within OwnerProvider");
  return ctx;
}

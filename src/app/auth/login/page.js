"use client";
export const dynamic = "force-dynamic";

import LoginPageInner from "./LoginPageInner";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

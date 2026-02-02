"use client";

import LoginPageInner from "./LoginPageInner";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}

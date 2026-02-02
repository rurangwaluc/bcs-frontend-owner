"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/cash", label: "Cash Control" },
  { href: "/credits", label: "Credit Risk" },
  { href: "/audit", label: "Audit Explorer" },
  // Drill-down (keep minimal for Phase 1)
  { href: "/sales", label: "Sales (drill-down)" },
  { href: "/staff", label: "People (drill-down)" },
];

export default function OwnerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 md:min-h-screen bg-white border-r">
      <div className="px-5 py-4 border-b">
        <div className="text-base font-semibold">BCS Owner</div>
        <div className="text-xs text-gray-500 mt-1">Oversight console</div>
      </div>

      <nav className="p-3 space-y-1">
        {NAV.map((it) => {
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={
                "block rounded-xl px-3 py-2 text-sm " +
                (active
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-100")
              }
            >
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4 text-xs text-gray-500 border-t">
        Built for accountability.
      </div>
    </aside>
  );
}

"use client";

import { useMemo, useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useOwner } from "../context/ownerContext";

function formatDateInput(d) {
  // YYYY-MM-DD
  const yr = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${yr}-${m}-${day}`;
}

function addDays(date, delta) {
  const d = new Date(date);
  d.setDate(d.getDate() + delta);
  return d;
}

function computePreset(preset) {
  const now = new Date();
  const today = formatDateInput(now);

  if (preset === "today") return { from: today, to: today };
  if (preset === "7d") return { from: formatDateInput(addDays(now, -6)), to: today };
  if (preset === "30d") return { from: formatDateInput(addDays(now, -29)), to: today };

  return { from: today, to: today };
}

export default function OwnerTopbar() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const { locations } = useOwner();

  const hasMultiLocation = (locations || []).length > 1;

  const currentPreset = sp.get("range") || "7d";
  const initialPresetRange = useMemo(() => computePreset(currentPreset), [currentPreset]);

  const [range, setRange] = useState(currentPreset);
  const [from, setFrom] = useState(sp.get("from") || initialPresetRange.from);
  const [to, setTo] = useState(sp.get("to") || initialPresetRange.to);

  const [locationId, setLocationId] = useState(sp.get("locationId") || "all");

  // Keep state in sync if user navigates back/forward
  useEffect(() => {
    const r = sp.get("range") || "7d";
    setRange(r);

    const preset = computePreset(r);
    setFrom(sp.get("from") || preset.from);
    setTo(sp.get("to") || preset.to);

    setLocationId(sp.get("locationId") || "all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  function apply(next) {
    const params = new URLSearchParams(sp.toString());

    // range/from/to
    if (next.range) params.set("range", next.range);
    if (next.from) params.set("from", next.from);
    if (next.to) params.set("to", next.to);

    // location
    if (hasMultiLocation) {
      if (next.locationId && next.locationId !== "all") {
        params.set("locationId", next.locationId);
      } else {
        params.delete("locationId");
      }
    } else {
      // single-location: no locationId in URL to reduce clutter
      params.delete("locationId");
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  function onRangeChange(v) {
    setRange(v);
    if (v === "custom") return;

    const preset = computePreset(v);
    setFrom(preset.from);
    setTo(preset.to);
    apply({ range: v, from: preset.from, to: preset.to, locationId });
  }

  function onApplyCustom() {
    apply({ range: "custom", from, to, locationId });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3">
      {/* Date range */}
      <div className="flex items-center gap-2 bg-white border rounded-xl px-3 py-2">
        <span className="text-xs font-medium text-gray-600">Range</span>
        <select
          className="text-sm outline-none bg-transparent"
          value={range}
          onChange={(e) => onRangeChange(e.target.value)}
        >
          <option value="today">Today</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="custom">Custom</option>
        </select>

        {range === "custom" ? (
          <div className="flex items-center gap-2 ml-2">
            <input
              type="date"
              className="text-sm border rounded-lg px-2 py-1"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <span className="text-xs text-gray-500">to</span>
            <input
              type="date"
              className="text-sm border rounded-lg px-2 py-1"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
            <button
              className="text-sm px-3 py-1.5 rounded-lg bg-black text-white hover:bg-gray-900"
              onClick={onApplyCustom}
              type="button"
            >
              Apply
            </button>
          </div>
        ) : null}
      </div>

      {/* Location */}
      {hasMultiLocation ? (
        <div className="flex items-center gap-2 bg-white border rounded-xl px-3 py-2">
          <span className="text-xs font-medium text-gray-600">Location</span>
          <select
            className="text-sm outline-none bg-transparent"
            value={locationId}
            onChange={(e) => {
              const v = e.target.value;
              setLocationId(v);
              apply({ range, from, to, locationId: v });
            }}
          >
            <option value="all">All locations</option>
            {locations.map((l) => (
              <option key={l.id} value={String(l.id)}>
                {l.name || `Location ${l.id}`}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
}

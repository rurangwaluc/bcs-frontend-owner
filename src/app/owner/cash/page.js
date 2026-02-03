"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { apiFetch } from "../../../lib/api";
import { useSearchParams } from "next/navigation";

const DIRECTIONS = ["", "IN", "OUT"];
const TYPES = [
  "", // all
  "SALE_PAYMENT",
  "VERSEMENT",
  "PETTY_CASH",
  "CREDIT_SETTLEMENT",
  "ADJUSTMENT",
];

function money(n) {
  const x = Number(n || 0);
  if (!Number.isFinite(x)) return "0";
  return x.toLocaleString();
}

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

function getSp(sp, key) {
  if (!sp) return "";
  const v = sp.get(key);
  return v ? String(v) : "";
}

function buildGlobalQuery(sp) {
  // Global filter bar encodes filters in URL: locationId/from/to/range
  const q = new URLSearchParams();

  const locationId = getSp(sp, "locationId");
  const from = getSp(sp, "from");
  const to = getSp(sp, "to");

  if (locationId) q.set("locationId", locationId);
  if (from) q.set("from", from);
  if (to) q.set("to", to);

  return q;
}

export default function CashPage() {
  const sp = useSearchParams();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [direction, setDirection] = useState("");
  const [type, setType] = useState("");
  const [limit, setLimit] = useState(100);

  const load = useCallback(async () => {
    setLoading(true);
    setMsg("");

    try {
      const q = buildGlobalQuery(sp);
      const qs = q.toString();
      const url = qs ? `/cash/ledger?${qs}` : "/cash/ledger";

      const data = await apiFetch(url, { method: "GET" });
      const list = data?.ledger ?? data?.rows ?? [];
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      setRows([]);
      setMsg(e?.data?.error || e?.message || "Failed to load cash ledger");
    } finally {
      setLoading(false);
    }
  }, [sp]);

  // Load whenever global filters change
  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let r = Array.isArray(rows) ? rows.slice() : [];

    if (direction) {
      const d = String(direction).toUpperCase();
      r = r.filter((x) => String(x?.direction || "").toUpperCase() === d);
    }

    if (type) {
      const t = String(type).toUpperCase();
      r = r.filter((x) => String(x?.type || "").toUpperCase() === t);
    }

    const lim = Math.min(Math.max(Number(limit) || 100, 1), 500);
    return r.slice(0, lim);
  }, [rows, direction, type, limit]);

  const summary = useMemo(() => {
    let inTotal = 0;
    let outTotal = 0;

    for (const x of filtered) {
      const amt = Number(x?.amount || 0);
      if (!Number.isFinite(amt)) continue;

      const dir = String(x?.direction || "").toUpperCase();
      if (dir === "IN") inTotal += amt;
      if (dir === "OUT") outTotal += amt;
    }

    return { inTotal, outTotal, net: inTotal - outTotal };
  }, [filtered]);

  const globalHint = useMemo(() => {
    const q = buildGlobalQuery(sp);
    const parts = [];
    const loc = q.get("locationId");
    const from = q.get("from");
    const to = q.get("to");

    if (loc) parts.push(`Location ${loc}`);
    if (from && to) parts.push(`${from} → ${to}`);

    return parts.length ? parts.join(" • ") : "All locations • Default range";
  }, [sp]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Cash Ledger</h1>
          <p className="text-sm text-gray-600 mt-1">
            Every money movement. Auditable.
          </p>
          <p className="text-xs text-gray-500 mt-1">{globalHint}</p>
        </div>

        <button
          onClick={load}
          className="px-4 py-2 rounded-lg bg-black text-white"
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {msg ? (
        <div className="mt-4 text-sm">
          <div className="p-3 rounded-lg bg-red-50 text-red-700">{msg}</div>
        </div>
      ) : null}

      {/* Summary cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card label="IN (filtered)" value={money(summary.inTotal)} />
        <Card label="OUT (filtered)" value={money(summary.outTotal)} />
        <Card label="NET (filtered)" value={money(summary.net)} />
      </div>

      {/* Filters */}
      <div className="mt-6 bg-white rounded-xl shadow p-4">
        <div className="font-semibold">Filters</div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            className="border rounded-lg px-3 py-2"
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
          >
            {DIRECTIONS.map((d) => (
              <option key={d} value={d}>
                {d ? d : "ALL directions"}
              </option>
            ))}
          </select>

          <select
            className="border rounded-lg px-3 py-2"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t ? t : "ALL types"}
              </option>
            ))}
          </select>

          <input
            className="border rounded-lg px-3 py-2"
            type="number"
            min="1"
            max="500"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          />

          <button
            onClick={() => {
              // client-side filters only; server reload uses global filters
            }}
            className="rounded-lg bg-black text-white px-4 py-2"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4 border-b">
          <div className="font-semibold">Ledger entries</div>
          <div className="text-xs text-gray-500 mt-1">
            Showing {filtered.length} rows (client-filtered). Global filters are
            applied in the request.
          </div>
        </div>

        {loading ? (
          <div className="p-4 text-sm text-gray-600">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left p-3">Time</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Direction</th>
                  <th className="text-right p-3">Amount</th>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Ref</th>
                  <th className="text-left p-3">Note</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r?.id} className="border-t">
                    <td className="p-3">
                      {formatDate(r?.createdAt || r?.time || r?.created_at)}
                    </td>
                    <td className="p-3">{r?.type || "-"}</td>
                    <td className="p-3">{r?.direction || "-"}</td>
                    <td className="p-3 text-right">{money(r?.amount)}</td>
                    <td className="p-3">{r?.userId || r?.user_id || "-"}</td>
                    <td className="p-3">
                      {r?.saleId
                        ? `sale:${r.saleId}`
                        : r?.creditId
                          ? `credit:${r.creditId}`
                          : r?.ref || "-"}
                    </td>
                    <td className="p-3 text-gray-600">
                      {r?.note || r?.description || "-"}
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 ? (
                  <tr>
                    <td className="p-4 text-sm text-gray-600" colSpan={7}>
                      No ledger entries.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

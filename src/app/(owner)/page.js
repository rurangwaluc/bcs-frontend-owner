import Link from "next/link";
import { serverApiFetch } from "../../lib/serverApi";

function fmtInt(n) {
  const x = Number(n || 0);
  if (!Number.isFinite(x)) return "0";
  return x.toLocaleString();
}

function getQuery(searchParams, key) {
  const v = searchParams?.[key];
  if (Array.isArray(v)) return v[0];
  return v || "";
}

async function fetchOwnerSummary(qs) {
  const primaryPath = `/owner/summary?${qs.toString()}`;
  const r1 = await serverApiFetch(primaryPath);

  if (r1.ok) return { ...r1, usedPath: primaryPath };

  if (r1.status === 404) {
    const fallbackPath = `/dashboard/owner/summary?${qs.toString()}`;
    const r2 = await serverApiFetch(fallbackPath);
    return { ...r2, usedPath: fallbackPath, primaryFailed: r1 };
  }

  return { ...r1, usedPath: primaryPath };
}

function StatLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="text-gray-600">{label}</div>
      <div className="font-medium text-gray-900">{value}</div>
    </div>
  );
}

function MiniHint({ children }) {
  return <div className="mt-2 text-xs text-gray-500">{children}</div>;
}

export default async function OverviewPage({ searchParams }) {
  const sp =
    searchParams && typeof searchParams.then === "function"
      ? await searchParams
      : searchParams;

  const locationId = getQuery(sp, "locationId");
  const from = getQuery(sp, "from");
  const to = getQuery(sp, "to");
  const range = getQuery(sp, "range") || "7d";

  const qs = new URLSearchParams();
  if (locationId) qs.set("locationId", locationId);
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);

  const sumRes = await fetchOwnerSummary(qs);
  const summary = sumRes.ok ? sumRes.data?.summary : null;

  const salesCount = Number(summary?.salesCount || 0);
  const salesTotal = Number(summary?.salesTotalAmount || 0);
  const payCount = Number(summary?.paymentsCount || 0);
  const payTotal = Number(summary?.paymentsTotalAmount || 0);

  // Owner lens: if sales exist but payments are low, it hints "cashier not recording" or "credit".
  const unrecordedHint =
    salesCount > 0 && payCount === 0
      ? "Sales exist but no payments recorded in this period."
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Overview</h1>
          <p className="mt-1 text-sm text-gray-600">
            Business health snapshot. Filters:{" "}
            <span className="font-medium text-gray-800">
              {range === "custom" && from && to ? `${from} → ${to}` : range}
            </span>
            .
          </p>
        </div>

        <div className="text-sm text-gray-600">
          <Link className="underline" href="/audit">
            Investigate via Audit Explorer
          </Link>
        </div>
      </div>

      {!sumRes.ok ? (
        <div className="bg-white border rounded-2xl p-5">
          <div className="text-sm text-red-700 font-medium">
            Failed to load summary
          </div>
          <div className="mt-2 text-xs text-gray-600 space-y-1">
            <div>
              <span className="font-medium">HTTP:</span> {sumRes.status}
            </div>
            <div>
              <span className="font-medium">Endpoint:</span> {sumRes.usedPath}
            </div>
            {sumRes.primaryFailed ? (
              <div>
                <span className="font-medium">Primary tried:</span>{" "}
                {sumRes.primaryFailed.status} on /owner/summary
              </div>
            ) : null}
            <div className="text-gray-500">
              {sumRes.data?.error || sumRes.data?.message || "Unknown error"}
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-2xl p-5">
          <div className="text-xs text-gray-500">Users</div>
          <div className="mt-2 text-2xl font-semibold">
            {fmtInt(summary?.usersCount)}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Staff & oversight accounts
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <div className="text-xs text-gray-500">Products</div>
          <div className="mt-2 text-2xl font-semibold">
            {fmtInt(summary?.productsCount)}
          </div>
          <div className="mt-2 text-xs text-gray-500">Active catalog items</div>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <div className="text-xs text-gray-500">Sales</div>
          <div className="mt-2 text-2xl font-semibold">
            {fmtInt(salesTotal)}
          </div>
          <div className="mt-1 text-xs text-gray-500">Total amount</div>
          <div className="mt-2 text-sm text-gray-700">
            <span className="font-medium">{fmtInt(salesCount)}</span> sale(s)
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <div className="text-xs text-gray-500">Payments</div>
          <div className="mt-2 text-2xl font-semibold">{fmtInt(payTotal)}</div>
          <div className="mt-1 text-xs text-gray-500">Total amount</div>
          <div className="mt-2 text-sm text-gray-700">
            <span className="font-medium">{fmtInt(payCount)}</span> payment(s)
          </div>
        </div>
      </div>

      {unrecordedHint ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="text-sm font-medium text-amber-900">
            Attention needed
          </div>
          <div className="mt-1 text-sm text-amber-800">{unrecordedHint}</div>
          <div className="mt-2 text-xs text-amber-700">
            Check “Awaiting payment” in staff dashboards or use Audit Explorer
            to confirm payment activity.
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Link
          href="/cash"
          className="bg-white border rounded-2xl p-5 hover:bg-gray-50"
        >
          <div className="text-sm font-semibold">Cash Control</div>
          <div className="mt-3 space-y-2">
            <StatLine label="Payments count" value={fmtInt(payCount)} />
            <StatLine label="Payments total" value={fmtInt(payTotal)} />
          </div>
          <MiniHint>
            Phase 2 adds: cash sessions, deposits, expenses, reconciliation.
          </MiniHint>
        </Link>

        <Link
          href="/credits"
          className="bg-white border rounded-2xl p-5 hover:bg-gray-50"
        >
          <div className="text-sm font-semibold">Credit Risk</div>
          <div className="mt-3 space-y-2">
            <StatLine label="Open credits" value="—" />
            <StatLine label="Exposure total" value="—" />
          </div>
          <MiniHint>
            Needs Phase 2 endpoint: open credits count + total exposure.
          </MiniHint>
        </Link>

        <Link
          href="/audit"
          className="bg-white border rounded-2xl p-5 hover:bg-gray-50"
        >
          <div className="text-sm font-semibold">Audit Explorer</div>
          <div className="mt-3 space-y-2">
            <StatLine label="Evidence" value="Search & filter" />
            <StatLine label="Use case" value="Fraud & disputes" />
          </div>
          <MiniHint>
            Use this when numbers don’t match and you need “who did what”.
          </MiniHint>
        </Link>
      </div>
    </div>
  );
}

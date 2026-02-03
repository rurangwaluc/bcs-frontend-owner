export const dynamic = "force-dynamic";

import OwnerHeader from "../../components/OwnerHeader";
import { OwnerProvider } from "../../context/ownerContext";
import OwnerSidebar from "../../components/OwnerSidebar";
import { redirect } from "next/navigation";
import { serverApiFetch } from "../../lib/serverApi";

export default async function OwnerLayout({ children }) {
  const meRes = await serverApiFetch("/auth/me");
  if (meRes.status === 401) {
    redirect("/login");
  }
  if (!meRes.ok) {
    return (
      <div className="p-6">
        <h1 className="text-lg font-semibold">Unable to load</h1>
        <p className="mt-2 text-sm text-gray-600">
          The owner console could not verify your session.
        </p>
      </div>
    );
  }

  const user = meRes.data?.user;
  if (!user) redirect("/login");

  if (String(user.role || "").toLowerCase() !== "owner") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border rounded-2xl p-6">
          <h1 className="text-lg font-semibold">Access denied</h1>
          <p className="mt-2 text-sm text-gray-600">
            This application is restricted to the business owner.
          </p>
          <div className="mt-4 text-xs text-gray-500">
            Logged in as: {user.email}
          </div>
        </div>
      </div>
    );
  }

  let locations = [];
  const locRes = await serverApiFetch("/owner/locations");
  if (locRes.ok) {
    locations = Array.isArray(locRes.data?.locations)
      ? locRes.data.locations
      : [];
  } else {
    if (user.locationId) {
      locations = [{ id: user.locationId, name: "Main location" }];
    }
  }

  return (
    <OwnerProvider locations={locations}>
      <div className="min-h-screen flex flex-col md:flex-row">
        <OwnerSidebar />
        <div className="flex-1 min-w-0">
          <OwnerHeader user={user} />
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </OwnerProvider>
  );
}

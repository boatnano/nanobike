import { RoleModeNav } from "@/components/RoleModeNav";
import { RiderJobsClient } from "@/components/rider/RiderJobsClient";
import { requireRiderActor } from "@/lib/auth";

export default async function RiderJobsPage() {
  await requireRiderActor();
  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-6">
      <RoleModeNav current="rider" />
      <RiderJobsClient />
    </main>
  );
}

import Link from "next/link";
import { RoleModeNav } from "@/components/RoleModeNav";
import { CustomerNewJobWizard } from "@/components/customer/CustomerNewJobWizard";
import { requireCustomerActor } from "@/lib/auth";

export default async function CustomerNewJobPage() {
  await requireCustomerActor();

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-6">
      <RoleModeNav current="customer" />
      <Link href="/customer" className="text-sm text-[var(--muted)]">
        ← กลับ
      </Link>
      <h1 className="font-display mt-3 text-2xl font-bold">เริ่มฝากซื้อ</h1>
      <p className="mb-4 text-sm text-[var(--muted)]">
        แผนที่ร้านทั้งหมด → ค้นหา/เลือก → รายการ → จุดส่ง → ไรเดอร์+ค่าส่ง
      </p>
      <CustomerNewJobWizard />
    </main>
  );
}

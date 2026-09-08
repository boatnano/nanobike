import { SiteHeader } from "@/components/SiteHeader";
import { BRAND } from "@/lib/constants";

export default function DonatePage() {
  const promptpay = process.env.NEXT_PUBLIC_DONATE_PROMPTPAY ?? "";
  const qrUrl = process.env.NEXT_PUBLIC_DONATE_QR_URL ?? "";

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-extrabold">สนับสนุน {BRAND.nameTh}</h1>
        <p className="mt-3 text-[var(--muted)]">
          ระบบไม่เก็บค่าคอมจากลูกค้าหรือไรเดอร์ การบริจาคใช้เป็นค่า server และกองจ่ายหมุดร้าน
          1 บาท/พิกัด (จ่ายไรเดอร์รายสัปดาห์หลังแอดมินยืนยัน)
        </p>

        <div className="mt-8 rounded-2xl border border-[var(--line)] bg-white/80 p-5">
          {qrUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrUrl} alt="QR บริจาค" className="mx-auto w-56 rounded-xl" />
          ) : (
            <div className="flex h-56 items-center justify-center rounded-xl bg-[var(--wash)] text-sm text-[var(--muted)]">
              ตั้งค่า NEXT_PUBLIC_DONATE_QR_URL เพื่อโชว์ QR
            </div>
          )}
          <p className="mt-4 text-center text-sm">
            พร้อมเพย์:{" "}
            <span className="font-semibold">
              {promptpay || "ยังไม่ตั้งค่า NEXT_PUBLIC_DONATE_PROMPTPAY"}
            </span>
          </p>
        </div>
      </section>
    </main>
  );
}

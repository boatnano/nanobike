import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BRAND, DELIVERY, TIMEOUTS } from "@/lib/constants";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader />
      <section className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 pb-16 pt-6 sm:px-6">
        <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-[var(--road)] uppercase">
          สมุทรสงคราม
        </p>
        <h1 className="font-display max-w-3xl text-5xl leading-[1.05] font-extrabold tracking-tight text-[var(--ink)] sm:text-7xl">
          {BRAND.name}
          <span className="mt-2 block text-3xl font-bold text-[var(--road)] sm:text-4xl">
            {BRAND.nameTh}
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-[var(--muted)]">
          {BRAND.tagline} เลือกไรเดอร์บนแผนที่ เห็นค่าส่งชัด
          โอนตรงให้ไรเดอร์หลังยืนยันยอดที่ร้าน
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-white"
          >
            สมัครสมาชิก
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--ink)]"
          >
            เข้าสู่ระบบ
          </Link>
        </div>
        <p className="mt-3 text-sm text-[var(--muted)]">
          สมัครครั้งแรกเป็นสมาชิกทั่วไป แล้วค่อยสมัครเป็นไรเดอร์ในบัญชีได้
        </p>

        <dl className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            {
              t: "ค่าส่งโปร่งใส",
              d: `ระยะถนนไป–กลับ × ${DELIVERY.ratePerKm} บาท/กม. ขั้นต่ำ ${DELIVERY.minFeeBaht} บาท`,
            },
            {
              t: "ไม่กินค่าคอม",
              d: "โอนตรงลูกค้า→ไรเดอร์ ไม่มีคนกลางถือเงินฝากซื้อ",
            },
            {
              t: "รู้ขั้นชัดเจน",
              d: `Roadmap งานคู่กันทั้งสองฝั่ง รับงาน ${TIMEOUTS.acceptSec / 60} นาที`,
            },
          ].map((item) => (
            <div
              key={item.t}
              className="rounded-2xl border border-[var(--line)] bg-white/75 p-4"
            >
              <dt className="font-display text-lg font-bold">{item.t}</dt>
              <dd className="mt-2 text-sm text-[var(--muted)]">{item.d}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}

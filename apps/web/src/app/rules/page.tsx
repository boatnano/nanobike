import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BRAND, DELIVERY } from "@/lib/constants";

export default function RulesPage() {
  return (
    <main>
      <SiteHeader />
      <article className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-3xl font-extrabold">กติกาชุมชน {BRAND.nameTh}</h1>
        <p className="mt-2 text-[var(--muted)]">
          อ่านแล้วยอมรับตอนสมัคร เพื่อให้ลูกค้าและไรเดอร์เข้าใจตรงกัน
        </p>

        <ol className="mt-8 space-y-5 text-sm leading-relaxed">
          <li>
            <strong>1. ไม่เป็นคนกลางถือเงิน</strong> — ลูกค้าโอนตรงให้ไรเดอร์ผ่านพร้อมเพย์
            แพลตฟอร์มไม่เก็บค่าคอมงานฝากซื้อ
          </li>
          <li>
            <strong>2. ไม่มีเก็บปลายทาง</strong> — โอนครบหลังยืนยันยอดที่ร้าน ก่อนไรเดอร์จ่ายร้าน
          </li>
          <li>
            <strong>3. ค่าส่ง</strong> — คิดจากระยะถนน (ไรเดอร์→ร้าน + ร้าน→จุดส่ง) × 2 ขา ×{" "}
            {DELIVERY.ratePerKm} บาท/กม. ขั้นต่ำ {DELIVERY.minFeeBaht} บาท ล็อกในงาน
          </li>
          <li>
            <strong>4. โฟลว์งาน</strong> — ยืนยันจุดส่ง → เลือกไรเดอร์ → รับงาน → ถึงร้าน →
            สรุปยอด → โอน+สลิป → จ่ายร้าน+หลักฐาน → ส่ง → โทรนัดรับ → รูป/คะแนน
          </li>
          <li>
            <strong>5. หลักฐานค่าของ</strong> — ใบเสร็จ หรือสลิปโอนให้ร้าน หรือรูปของ+รายการย่อย
          </li>
          <li>
            <strong>6. เวลายกเลิก</strong> — ก่อนรับยกเลิกได้; หลังถึงร้าน/สรุปยอดแล้วถ้าทิ้งงานบ่อย
            แอดมินพิจารณา; ร้านปิด/ของหมดกดได้โดยไรเดอร์
          </li>
          <li>
            <strong>7. ข้อพิพาท</strong> — แอดมินดูไทม์ไลน์งานช่วยพิจารณา แต่ไม่รับประกันคืนเงินอัตโนมัติ
            เพราะไม่ได้ถือเงิน
          </li>
          <li>
            <strong>8. บริจาค</strong> — ใช้ค่า server และกองจ่ายหมุดร้าน 1 บาท/พิกัด (หลังแอดมินยืนยัน
            จ่ายรายสัปดาห์)
          </li>
        </ol>

        <Link href="/signup" className="mt-8 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--ink)]">
          ไปสมัครใช้งาน
        </Link>
      </article>
    </main>
  );
}

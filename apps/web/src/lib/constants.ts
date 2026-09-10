export const BRAND = {
  id: "nanobike",
  name: "nanobike",
  nameTh: "นาโน Bike",
  tagline: "ฝากซื้อชุมชนสมุทรสงคราม — โปร่งใส ไม่กินค่าคอม",
} as const;

export const DELIVERY = {
  ratePerKm: 3.5,
  roundTripFactor: 2,
  minFeeBaht: 20,
} as const;

export const TIMEOUTS = {
  acceptSec: 300,
  quoteSec: 600,
  paySec: 900,
} as const;

export const JOB_ROADMAP = [
  { key: "pending_rider", label: "รอรับงาน" },
  { key: "going_to_shop", label: "กำลังไปร้าน" },
  { key: "at_shop", label: "ถึงร้านแล้ว" },
  { key: "quote_pending", label: "ยืนยันยอด" },
  { key: "awaiting_payment", label: "รอโอนเงิน" },
  { key: "paid_pending", label: "ยืนยันรับเงิน" },
  { key: "shopping", label: "จ่ายร้าน/ซื้อของ" },
  { key: "delivering", label: "กำลังส่ง" },
  { key: "completed", label: "ส่งสำเร็จ" },
] as const;

export type JobRoadmapKey = (typeof JOB_ROADMAP)[number]["key"];

export function phoneToAuthEmail(phone: string) {
  const digits = phone.replace(/\D/g, "");
  // Must use a real-looking TLD — Supabase Auth rejects `.local` / `.test` / `.example`.
  return `${digits}@users.nanobike.app`;
}

export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("66") && digits.length >= 11) {
    return `0${digits.slice(2)}`;
  }
  return digits;
}

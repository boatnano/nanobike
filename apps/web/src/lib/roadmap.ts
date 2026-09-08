import type { JobRoadmapKey } from "./constants";
import { JOB_ROADMAP } from "./constants";

const STATUS_TO_STEP: Record<string, JobRoadmapKey> = {
  pending_rider: "pending_rider",
  going_to_shop: "going_to_shop",
  at_shop: "at_shop",
  quote_pending: "quote_pending",
  awaiting_payment: "awaiting_payment",
  paid_pending: "paid_pending",
  shopping: "shopping",
  delivering: "delivering",
  completed: "completed",
  cancelled: "pending_rider",
  rejected: "pending_rider",
  cancelled_shop: "at_shop",
};

export function roadmapIndexForStatus(status: string) {
  const key = STATUS_TO_STEP[status] ?? "pending_rider";
  return JOB_ROADMAP.findIndex((s) => s.key === key);
}

export function roadmapHint(status: string, role: "customer" | "rider") {
  const map: Record<string, { customer: string; rider: string }> = {
    pending_rider: {
      customer: "รอไรเดอร์รับงาน (ภายใน 5 นาที)",
      rider: "มีงานเข้า — กดรับหรือปฏิเสธ",
    },
    going_to_shop: {
      customer: "ไรเดอร์กำลังไปร้าน",
      rider: "ไปร้านแล้วกด “ถึงร้านแล้ว”",
    },
    at_shop: {
      customer: "ไรเดอร์ถึงร้านแล้ว กำลังสรุปยอด",
      rider: "สรุปค่าของ หรือกดร้านปิด/ของหมด",
    },
    quote_pending: {
      customer: "กรุณายืนยันยอดค่าของ (ภายใน 10 นาที)",
      rider: "รอลูกค้ายืนยันยอด",
    },
    awaiting_payment: {
      customer: "โอนเงินแล้วอัปสลิป (ภายใน 15 นาที)",
      rider: "รอสลิปจากลูกค้า",
    },
    paid_pending: {
      customer: "รอไรเดอร์ยืนยันรับเงิน",
      rider: "ตรวจสลิปแล้วกดยืนยันรับเงิน",
    },
    shopping: {
      customer: "ไรเดอร์กำลังจ่ายร้าน/ซื้อของ",
      rider: "จ่ายร้าน + อัปหลักฐานค่าของ",
    },
    delivering: {
      customer: "ไรเดอร์กำลังนำส่ง — รอสายได้",
      rider: "โทรนัดรับ + ถ่ายรูปส่งถึง",
    },
    completed: {
      customer: "ส่งสำเร็จแล้ว — ให้คะแนนได้",
      rider: "งานเสร็จ — ให้คะแนนได้",
    },
    cancelled: {
      customer: "งานถูกยกเลิก",
      rider: "งานถูกยกเลิก",
    },
    rejected: {
      customer: "ไรเดอร์ไม่รับงาน / หมดเวลา",
      rider: "งานหมดเวลาหรือถูกปฏิเสธ",
    },
    cancelled_shop: {
      customer: "ร้านปิดหรือของหมด",
      rider: "แจ้งร้านปิด/ของหมดแล้ว",
    },
  };
  return map[status]?.[role] ?? "กำลังดำเนินการ";
}

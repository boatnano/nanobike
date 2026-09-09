import Link from "next/link";
import { notFound } from "next/navigation";
import { CustomerQuoteActions } from "@/components/customer/CustomerQuoteActions";
import { JobLiveRefresh } from "@/components/customer/JobLiveRefresh";
import { PaymentSlipUpload } from "@/components/customer/PaymentSlipUpload";
import { JobRoadmap } from "@/components/JobRoadmap";
import { RoleModeNav } from "@/components/RoleModeNav";
import { requireCustomerActor } from "@/lib/auth";
import { roadmapHint } from "@/lib/roadmap";

export default async function CustomerJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, profile } = await requireCustomerActor();

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("customer_id", profile.id)
    .maybeSingle();

  if (!job) notFound();

  let riderName: string | null = null;
  let riderPromptpay: string | null = null;
  if (job.rider_id && job.status !== "pending_rider") {
    const [{ data: rider }, { data: riderProf }] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", job.rider_id)
        .maybeSingle(),
      supabase
        .from("rider_profiles")
        .select("promptpay_id")
        .eq("user_id", job.rider_id)
        .maybeSingle(),
    ]);
    riderName = rider ? `${rider.full_name} · ${rider.phone}` : null;
    riderPromptpay = riderProf?.promptpay_id ?? null;
  }

  const goods = Number(job.goods_confirmed ?? job.goods_quote ?? 0);
  const fee = Number(job.delivery_fee ?? 0);
  const total = goods + fee;

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-6">
      <JobLiveRefresh
        enabled={[
          "pending_rider",
          "going_to_shop",
          "at_shop",
          "quote_pending",
          "awaiting_payment",
          "paid_pending",
          "shopping",
          "delivering",
        ].includes(job.status)}
      />
      <RoleModeNav current="customer" />
      <Link href="/customer/jobs" className="text-sm text-[var(--muted)]">
        ← งานของฉัน
      </Link>
      <h1 className="font-display mt-3 text-2xl font-bold">{job.shop_name}</h1>
      <p className="text-sm text-[var(--muted)]">{roadmapHint(job.status, "customer")}</p>

      <div className="mt-4">
        <JobRoadmap status={job.status} role="customer" />
      </div>

      <section className="mt-4 space-y-3 rounded-2xl border border-[var(--line)] bg-white/85 p-4 text-sm">
        <p>
          <span className="text-[var(--muted)]">รายการ: </span>
          {job.shopping_list}
        </p>
        <p>
          <span className="text-[var(--muted)]">จุดส่ง: </span>
          {job.dropoff_address}
        </p>
        <p>
          <span className="text-[var(--muted)]">ค่าส่ง: </span>
          <strong>{job.delivery_fee}฿</strong>
          {job.distance_source === "straight" ? " (ระยะประมาณ)" : ""}
        </p>
        {job.goods_budget != null ? (
          <p>
            <span className="text-[var(--muted)]">งบค่าของ: </span>
            {job.goods_budget}฿
          </p>
        ) : null}
        {job.goods_quote != null ? (
          <p>
            <span className="text-[var(--muted)]">ยอดจากไรเดอร์: </span>
            {job.goods_quote}฿
          </p>
        ) : null}
        {riderName ? (
          <p>
            <span className="text-[var(--muted)]">ไรเดอร์: </span>
            {riderName}
          </p>
        ) : (
          <p className="text-[var(--muted)]">
            รอไรเดอร์รับงาน
            {job.accept_deadline_at
              ? ` (ถึง ${new Date(job.accept_deadline_at).toLocaleTimeString("th-TH")})`
              : ""}
          </p>
        )}
      </section>

      {job.status === "quote_pending" && job.goods_quote != null ? (
        <CustomerQuoteActions
          jobId={job.id}
          goodsQuote={Number(job.goods_quote)}
          deliveryFee={fee}
          quoteDeadlineAt={job.quote_deadline_at}
        />
      ) : null}

      {job.status === "awaiting_payment" ? (
        <PaymentSlipUpload
          jobId={job.id}
          goodsConfirmed={Number(job.goods_confirmed ?? 0)}
          deliveryFee={fee}
          promptpayId={riderPromptpay}
          payDeadlineAt={job.pay_deadline_at}
        />
      ) : null}

      {job.status === "paid_pending" ? (
        <section className="mt-4 space-y-2 rounded-2xl border border-[var(--line)] bg-white/85 p-4 text-sm">
          <p className="font-display text-lg font-bold">ส่งสลิปแล้ว</p>
          <p>
            รวม {total}฿ — รอไรเดอร์ยืนยันรับเงิน
          </p>
          {job.payment_slip_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <a
              href={job.payment_slip_url}
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              <img
                src={job.payment_slip_url}
                alt="สลิปโอน"
                className="max-h-40 w-full rounded-lg object-contain"
              />
            </a>
          ) : null}
        </section>
      ) : null}

      {job.status === "shopping" || job.status === "delivering" ? (
        <p className="mt-4 rounded-2xl border border-[var(--line)] bg-white/85 px-4 py-3 text-sm">
          {job.status === "shopping"
            ? "ไรเดอร์กำลังซื้อของให้"
            : "ไรเดอร์กำลังส่งของมาหาคุณ"}
        </p>
      ) : null}

      {job.status === "completed" ? (
        <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          ส่งสำเร็จแล้ว — ขอบคุณที่ใช้ {job.shop_name}
        </p>
      ) : null}

      {job.status === "cancelled_shop" ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          งานยกเลิก: {job.cancel_reason ?? "ร้านปิด/ของหมด"}
        </p>
      ) : null}
    </main>
  );
}

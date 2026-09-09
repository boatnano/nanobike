"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  createJob,
  listNearbyRidersWithFees,
  searchApprovedShops,
  type RiderFeeOption,
  type ShopResult,
} from "@/app/customer/actions";

const DropoffMap = dynamic(
  () => import("@/components/map/DropoffMap").then((m) => m.DropoffMap),
  { ssr: false, loading: () => <div className="h-72 animate-pulse rounded-2xl bg-[var(--wash)]" /> },
);

const RiderPickMap = dynamic(
  () => import("@/components/map/RiderPickMap").then((m) => m.RiderPickMap),
  { ssr: false, loading: () => <div className="h-80 animate-pulse rounded-2xl bg-[var(--wash)]" /> },
);

type Step = "shop" | "details" | "dropoff" | "riders";

const MAE_KLONG = { lat: 13.4145, lng: 100.0025 };

export function CustomerNewJobWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("shop");
  const [query, setQuery] = useState("");
  const [shops, setShops] = useState<ShopResult[]>([]);
  const [selectedShop, setSelectedShop] = useState<ShopResult | null>(null);
  const [customShop, setCustomShop] = useState(false);
  const [shopName, setShopName] = useState("");
  const [shopLat, setShopLat] = useState(MAE_KLONG.lat);
  const [shopLng, setShopLng] = useState(MAE_KLONG.lng);
  const [shoppingList, setShoppingList] = useState("");
  const [goodsBudget, setGoodsBudget] = useState("");
  const [dropoffLat, setDropoffLat] = useState(MAE_KLONG.lat);
  const [dropoffLng, setDropoffLng] = useState(MAE_KLONG.lng);
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [dropoffConfirmed, setDropoffConfirmed] = useState(false);
  const [riders, setRiders] = useState<RiderFeeOption[]>([]);
  const [selectedRiderId, setSelectedRiderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selectedRider = useMemo(
    () => riders.find((r) => r.riderId === selectedRiderId) ?? null,
    [riders, selectedRiderId],
  );

  function runSearch() {
    startTransition(async () => {
      setError(null);
      try {
        const result = await searchApprovedShops(query);
        setShops(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "ค้นหาไม่สำเร็จ");
      }
    });
  }

  function pickShop(shop: ShopResult) {
    setSelectedShop(shop);
    setCustomShop(false);
    setShopName(shop.name);
    setShopLat(shop.lat);
    setShopLng(shop.lng);
    setStep("details");
  }

  function loadRiders() {
    startTransition(async () => {
      setError(null);
      try {
        const result = await listNearbyRidersWithFees({
          shopLat,
          shopLng,
          dropoffLat,
          dropoffLng,
        });
        setRiders(result);
        setSelectedRiderId(result[0]?.riderId ?? null);
        setStep("riders");
      } catch (err) {
        setError(err instanceof Error ? err.message : "โหลดไรเดอร์ไม่สำเร็จ");
      }
    });
  }

  function submitJob() {
    if (!selectedRiderId) {
      setError("กรุณาเลือกไรเดอร์");
      return;
    }
    startTransition(async () => {
      setError(null);
      try {
        const { jobId } = await createJob({
          shopId: selectedShop?.id ?? null,
          shopName,
          shopLat,
          shopLng,
          dropoffLat,
          dropoffLng,
          dropoffAddress,
          shoppingList,
          goodsBudget: goodsBudget ? Number(goodsBudget) : null,
          riderId: selectedRiderId,
        });
        router.push(`/customer/jobs/${jobId}`);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "สร้างงานไม่สำเร็จ");
      }
    });
  }

  return (
    <div className="space-y-4">
      <ol className="flex flex-wrap gap-2 text-[11px] font-semibold">
        {(
          [
            ["shop", "1. ร้าน"],
            ["details", "2. รายการ"],
            ["dropoff", "3. จุดส่ง"],
            ["riders", "4. ไรเดอร์"],
          ] as const
        ).map(([id, label]) => (
          <li
            key={id}
            className={
              step === id
                ? "rounded-full bg-[var(--accent)] px-2.5 py-1"
                : "rounded-full border border-[var(--line)] px-2.5 py-1 text-[var(--muted)]"
            }
          >
            {label}
          </li>
        ))}
      </ol>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {step === "shop" ? (
        <section className="space-y-3 rounded-2xl border border-[var(--line)] bg-white/85 p-4">
          <h2 className="font-display text-lg font-bold">ค้นหาร้าน</h2>
          <div className="flex gap-2">
            <input
              className="w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm"
              placeholder="เช่น ก๋วยเตี๋ยว, เซเว่น, ตลาด"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch();
              }}
            />
            <button
              type="button"
              disabled={pending}
              onClick={runSearch}
              className="rounded-xl bg-[var(--ink)] px-4 text-sm font-semibold text-white disabled:opacity-60"
            >
              ค้นหา
            </button>
          </div>
          <ul className="space-y-2">
            {shops.map((shop) => (
              <li key={shop.id}>
                <button
                  type="button"
                  onClick={() => pickShop(shop)}
                  className="w-full rounded-xl border border-[var(--line)] px-3 py-3 text-left hover:bg-[var(--wash)]"
                >
                  <p className="font-semibold">{shop.name}</p>
                  <p className="text-xs text-[var(--muted)]">{shop.address}</p>
                </button>
              </li>
            ))}
          </ul>
          {!shops.length ? (
            <p className="text-sm text-[var(--muted)]">
              พิมพ์คีย์เวิร์ดแล้วกดค้นหา หรือปักหมุดร้านเอง
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setCustomShop(true);
              setSelectedShop(null);
              setShopName("");
              setStep("details");
            }}
            className="w-full rounded-xl border border-dashed border-[var(--line)] px-3 py-3 text-sm font-medium"
          >
            ไม่เจอร้าน — ปักหมุดร้านเอง
          </button>
        </section>
      ) : null}

      {step === "details" ? (
        <section className="space-y-3 rounded-2xl border border-[var(--line)] bg-white/85 p-4">
          <h2 className="font-display text-lg font-bold">รายการฝากซื้อ</h2>
          {customShop ? (
            <>
              <label className="block text-sm">
                ชื่อร้าน
                <input
                  className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  required
                />
              </label>
              <p className="text-xs text-[var(--muted)]">
                แตะแผนที่ด้านล่างเพื่อปักหมุดร้าน (ค่าเริ่มต้นใกล้แม่กลอง)
              </p>
              <DropoffMap
                lat={shopLat}
                lng={shopLng}
                mode="shop"
                onChange={(lat, lng) => {
                  setShopLat(lat);
                  setShopLng(lng);
                }}
              />
            </>
          ) : (
            <p className="rounded-xl bg-[var(--wash)] px-3 py-2 text-sm">
              ร้าน: <strong>{shopName}</strong>
            </p>
          )}
          <label className="block text-sm">
            รายการฝากซื้อ
            <textarea
              className="mt-1 min-h-28 w-full rounded-xl border border-[var(--line)] px-3 py-2"
              value={shoppingList}
              onChange={(e) => setShoppingList(e.target.value)}
              placeholder="เช่น กาแฟ 2 แก้ว, ข้าวผัดหมู 1 จาน"
              required
            />
          </label>
          <label className="block text-sm">
            งบค่าของโดยประมาณ (บาท, ไม่บังคับ)
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
              value={goodsBudget}
              onChange={(e) => setGoodsBudget(e.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep("shop")}
              className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm"
            >
              ย้อนกลับ
            </button>
            <button
              type="button"
              disabled={!shopName.trim() || !shoppingList.trim()}
              onClick={() => setStep("dropoff")}
              className="flex-1 rounded-xl bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              ต่อไป — จุดส่ง
            </button>
          </div>
        </section>
      ) : null}

      {step === "dropoff" ? (
        <section className="space-y-3 rounded-2xl border border-[var(--line)] bg-white/85 p-4">
          <h2 className="font-display text-lg font-bold">ยืนยันจุดส่ง</h2>
          <p className="text-xs text-[var(--muted)]">
            ใช้พิกัดปัจจุบัน หรือแตะแผนที่/ลากหมุดเพื่อแก้
          </p>
          <button
            type="button"
            className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm"
            onClick={() => {
              if (!navigator.geolocation) {
                setError("เบราว์เซอร์ไม่รองรับ GPS");
                return;
              }
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  setDropoffLat(pos.coords.latitude);
                  setDropoffLng(pos.coords.longitude);
                  setDropoffConfirmed(false);
                },
                () => setError("อ่าน GPS ไม่ได้ — ปักหมุดบนแผนที่แทนได้"),
                { enableHighAccuracy: true, timeout: 12000 },
              );
            }}
          >
            ใช้ตำแหน่งปัจจุบัน
          </button>
          <DropoffMap
            lat={dropoffLat}
            lng={dropoffLng}
            mode="home"
            onChange={(lat, lng) => {
              setDropoffLat(lat);
              setDropoffLng(lng);
              setDropoffConfirmed(false);
            }}
          />
          <label className="block text-sm">
            ที่อยู่ / จุดสังเกต
            <input
              className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
              value={dropoffAddress}
              onChange={(e) => setDropoffAddress(e.target.value)}
              placeholder="บ้านเลขที่ / ซอย / จุดสังเกต"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={dropoffConfirmed}
              onChange={(e) => setDropoffConfirmed(e.target.checked)}
            />
            ยืนยันว่าหมุดจุดส่งถูกต้อง
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep("details")}
              className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm"
            >
              ย้อนกลับ
            </button>
            <button
              type="button"
              disabled={!dropoffConfirmed || !dropoffAddress.trim() || pending}
              onClick={loadRiders}
              className="flex-1 rounded-xl bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {pending ? "กำลังคำนวณค่าส่ง..." : "ต่อไป — เลือกไรเดอร์"}
            </button>
          </div>
        </section>
      ) : null}

      {step === "riders" ? (
        <section className="space-y-3 rounded-2xl border border-[var(--line)] bg-white/85 p-4">
          <h2 className="font-display text-lg font-bold">เลือกไรเดอร์</h2>
          {!riders.length ? (
            <p className="text-sm text-[var(--muted)]">
              ยังไม่มีไรเดอร์เปิดรับงานใกล้ร้าน — สลับโหมดไรเดอร์แล้วเปิดรับงาน + อัปเดตพิกัดก่อน
            </p>
          ) : (
            <>
              <RiderPickMap
                shop={{ lat: shopLat, lng: shopLng }}
                dropoff={{ lat: dropoffLat, lng: dropoffLng }}
                riders={riders}
                selectedRiderId={selectedRiderId}
                onSelect={setSelectedRiderId}
              />
              <ul className="space-y-2">
                {riders.map((rider, idx) => (
                  <li key={rider.riderId}>
                    <button
                      type="button"
                      onClick={() => setSelectedRiderId(rider.riderId)}
                      className={`w-full rounded-xl border px-3 py-3 text-left ${
                        selectedRiderId === rider.riderId
                          ? "border-[var(--ink)] bg-[var(--wash)]"
                          : "border-[var(--line)]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold">
                          {idx === 0 ? "ใกล้สุด · " : ""}
                          {rider.displayName}
                        </p>
                        <p className="font-bold">{rider.deliveryFee}฿</p>
                      </div>
                      <p className="text-xs text-[var(--muted)]">
                        ห่างร้าน ~{rider.kmToShop.toFixed(1)} กม. · ค่าส่ง{" "}
                        {rider.usedMinFee ? "ขั้นต่ำ 20฿" : `${rider.kmBillable.toFixed(1)} กม.×2×3.5`} ·{" "}
                        {rider.distanceSource === "road" ? "ระยะถนน" : "ระยะประมาณ"}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {selectedRider ? (
            <p className="rounded-xl bg-[var(--wash)] px-3 py-2 text-sm">
              เลือก <strong>{selectedRider.displayName}</strong> ค่าส่ง{" "}
              <strong>{selectedRider.deliveryFee}฿</strong>
            </p>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep("dropoff")}
              className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm"
            >
              ย้อนกลับ
            </button>
            <button
              type="button"
              disabled={!selectedRiderId || pending}
              onClick={submitJob}
              className="flex-1 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {pending ? "กำลังสร้างงาน..." : "ยืนยันเลือกคนนี้"}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}

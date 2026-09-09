"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useTransition } from "react";
import { setRiderAvailability, upsertRiderLocation } from "@/app/rider/actions";

const RiderSelfMap = dynamic(
  () => import("@/components/map/RiderSelfMap").then((m) => m.RiderSelfMap),
  { ssr: false, loading: () => <div className="h-80 animate-pulse rounded-2xl bg-[var(--wash)]" /> },
);

const MAE_KLONG = { lat: 13.4145, lng: 100.0025 };

export function RiderMapClient({
  initialLat,
  initialLng,
  initiallyAvailable,
}: {
  initialLat: number | null;
  initialLng: number | null;
  initiallyAvailable: boolean;
}) {
  const [lat, setLat] = useState(initialLat ?? MAE_KLONG.lat);
  const [lng, setLng] = useState(initialLng ?? MAE_KLONG.lng);
  const [available, setAvailable] = useState(initiallyAvailable);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function saveLocation(nextLat: number, nextLng: number, source: "gps" | "manual") {
    setLat(nextLat);
    setLng(nextLng);
    startTransition(async () => {
      setError(null);
      try {
        await upsertRiderLocation({ lat: nextLat, lng: nextLng, source });
        setMessage("อัปเดตพิกัดแล้ว");
      } catch (err) {
        setError(err instanceof Error ? err.message : "บันทึกพิกัดไม่สำเร็จ");
      }
    });
  }

  useEffect(() => {
    if (initialLat != null && initialLng != null) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        saveLocation(pos.coords.latitude, pos.coords.longitude, "gps");
      },
      () => undefined,
      { enableHighAccuracy: true, timeout: 10000 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <h1 className="font-display mt-3 text-2xl font-bold">แผนที่ตำแหน่งฉัน</h1>
      <p className="mb-3 text-sm text-[var(--muted)]">
        รีเฟรช GPS หรือลากหมุดถ้าเพี้ยน — ลูกค้าจะเห็นตอนเปิดรับงาน
      </p>

      <label className="mb-3 flex items-center justify-between rounded-2xl border border-[var(--line)] bg-white/85 px-4 py-3">
        <span className="text-sm font-semibold">เปิดรับงาน</span>
        <input
          type="checkbox"
          checked={available}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.checked;
            startTransition(async () => {
              setError(null);
              try {
                await setRiderAvailability(next);
                setAvailable(next);
                setMessage(next ? "เปิดรับงานแล้ว" : "ปิดรับงานแล้ว");
              } catch (err) {
                setError(err instanceof Error ? err.message : "เปลี่ยนสถานะไม่สำเร็จ");
              }
            });
          }}
        />
      </label>

      <div className="mb-3 flex gap-2">
        <button
          type="button"
          disabled={pending}
          className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm"
          onClick={() => {
            if (!navigator.geolocation) {
              setError("เบราว์เซอร์ไม่รองรับ GPS");
              return;
            }
            navigator.geolocation.getCurrentPosition(
              (pos) =>
                saveLocation(pos.coords.latitude, pos.coords.longitude, "gps"),
              () => setError("อ่าน GPS ไม่ได้"),
              { enableHighAccuracy: true, timeout: 12000 },
            );
          }}
        >
          รีเฟรช GPS
        </button>
        <button
          type="button"
          disabled={pending}
          className="rounded-xl bg-[var(--ink)] px-3 py-2 text-sm font-semibold text-white"
          onClick={() => saveLocation(lat, lng, "manual")}
        >
          บันทึกพิกัดนี้
        </button>
      </div>

      {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
      {message ? <p className="mb-2 text-sm text-[var(--muted)]">{message}</p> : null}

      <RiderSelfMap
        lat={lat}
        lng={lng}
        onChange={(nextLat, nextLng) => saveLocation(nextLat, nextLng, "manual")}
      />
    </>
  );
}

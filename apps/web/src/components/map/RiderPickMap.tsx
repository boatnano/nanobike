"use client";

import { useMemo } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { RiderFeeOption } from "@/app/customer/actions";
import { BaseMap, homeIcon, shopIcon } from "@/components/map/BaseMap";

function riderFeeIcon(fee: number, selected: boolean, cheapest: boolean) {
  const bg = selected ? "#111" : cheapest ? "#b8f26d" : "#fff8dc";
  const color = selected ? "#b8f26d" : "#111";
  const border = selected ? "#b8f26d" : "#111";
  const label = cheapest ? `🛵 ${fee}฿ ใกล้` : `🛵 ${fee}฿`;
  return L.divIcon({
    className: "",
    html: `<div style="background:${bg};color:${color};border:2px solid ${border};border-radius:999px;padding:3px 8px;font-size:12px;font-weight:800;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.28)">${label}</div>`,
    iconSize: [88, 28],
    iconAnchor: [44, 14],
  });
}

export function RiderPickMap({
  shop,
  dropoff,
  riders,
  selectedRiderId,
  onSelect,
}: {
  shop: { lat: number; lng: number };
  dropoff: { lat: number; lng: number };
  riders: RiderFeeOption[];
  selectedRiderId: string | null;
  onSelect: (riderId: string) => void;
}) {
  const points = useMemo(
    () => [
      shop,
      dropoff,
      ...riders.map((r) => ({ lat: r.lat, lng: r.lng })),
    ],
    [shop, dropoff, riders],
  );

  const cheapestId = riders[0]?.riderId ?? null;

  return (
    <BaseMap
      center={shop}
      points={points}
      className="h-[440px] w-full overflow-hidden rounded-2xl border border-[var(--line)]"
    >
      <Marker position={[shop.lat, shop.lng]} icon={shopIcon} zIndexOffset={500}>
        <Popup>ร้านฝากซื้อ</Popup>
      </Marker>
      <Marker position={[dropoff.lat, dropoff.lng]} icon={homeIcon} zIndexOffset={500}>
        <Popup>จุดส่งของคุณ</Popup>
      </Marker>
      {riders.map((rider) => {
        const selected = selectedRiderId === rider.riderId;
        const cheapest = rider.riderId === cheapestId;
        return (
          <Marker
            key={rider.riderId}
            position={[rider.lat, rider.lng]}
            icon={riderFeeIcon(rider.deliveryFee, selected, cheapest)}
            zIndexOffset={selected ? 1200 : cheapest ? 900 : 700}
            eventHandlers={{
              click: () => onSelect(rider.riderId),
            }}
          >
            <Popup>
              <div className="min-w-[140px] text-sm">
                <p className="font-semibold">{rider.displayName}</p>
                <p className="mt-1 font-bold text-base">{rider.deliveryFee}฿</p>
                <p className="text-xs text-gray-600">
                  ห่างร้าน ~{rider.kmToShop.toFixed(1)} กม.
                  {cheapest ? " · ใกล้/ถูกสุดในรายการ" : ""}
                </p>
                <p className="text-xs text-gray-600">
                  {rider.distanceSource === "road" ? "ระยะถนน" : "ระยะประมาณ"}
                  {rider.usedMinFee ? " · ขั้นต่ำ 20฿" : ""}
                </p>
                <button
                  type="button"
                  className="mt-2 w-full rounded-full bg-black px-2 py-1 text-xs font-semibold text-white"
                  onClick={() => onSelect(rider.riderId)}
                >
                  เลือกคนนี้
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </BaseMap>
  );
}

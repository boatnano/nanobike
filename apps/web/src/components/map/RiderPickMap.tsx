"use client";

import { Marker, Popup } from "react-leaflet";
import type { RiderFeeOption } from "@/app/customer/actions";
import { BaseMap, homeIcon, riderIcon, shopIcon } from "@/components/map/BaseMap";

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
  const points = [
    shop,
    dropoff,
    ...riders.map((r) => ({ lat: r.lat, lng: r.lng })),
  ];

  return (
    <BaseMap
      center={shop}
      points={points}
      className="h-80 w-full overflow-hidden rounded-2xl border border-[var(--line)]"
    >
      <Marker position={[shop.lat, shop.lng]} icon={shopIcon}>
        <Popup>ร้าน</Popup>
      </Marker>
      <Marker position={[dropoff.lat, dropoff.lng]} icon={homeIcon}>
        <Popup>จุดส่ง</Popup>
      </Marker>
      {riders.map((rider) => (
        <Marker
          key={rider.riderId}
          position={[rider.lat, rider.lng]}
          icon={riderIcon}
          opacity={selectedRiderId === rider.riderId ? 1 : 0.75}
          eventHandlers={{
            click: () => onSelect(rider.riderId),
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{rider.displayName}</p>
              <p>ค่าส่ง {rider.deliveryFee}฿</p>
              <button
                type="button"
                className="mt-1 underline"
                onClick={() => onSelect(rider.riderId)}
              >
                เลือกคนนี้
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </BaseMap>
  );
}

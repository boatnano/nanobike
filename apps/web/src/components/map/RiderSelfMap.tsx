"use client";

import { Marker, Popup } from "react-leaflet";
import { BaseMap, selfIcon } from "@/components/map/BaseMap";

export function RiderSelfMap({
  lat,
  lng,
  onChange,
}: {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}) {
  return (
    <BaseMap
      center={{ lat, lng }}
      points={[{ lat, lng }]}
      onPick={onChange}
      className="h-80 w-full overflow-hidden rounded-2xl border border-[var(--line)]"
    >
      <Marker
        position={[lat, lng]}
        icon={selfIcon}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const p = e.target.getLatLng();
            onChange(p.lat, p.lng);
          },
        }}
      >
        <Popup>ตำแหน่งฉัน (ลากแก้ได้)</Popup>
      </Marker>
    </BaseMap>
  );
}

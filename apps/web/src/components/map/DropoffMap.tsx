"use client";

import { Marker, Popup } from "react-leaflet";
import { BaseMap, homeIcon, shopIcon } from "@/components/map/BaseMap";

export function DropoffMap({
  lat,
  lng,
  mode,
  onChange,
}: {
  lat: number;
  lng: number;
  mode: "home" | "shop";
  onChange: (lat: number, lng: number) => void;
}) {
  return (
    <BaseMap
      center={{ lat, lng }}
      points={[{ lat, lng }]}
      onPick={onChange}
      className="h-72 w-full overflow-hidden rounded-2xl border border-[var(--line)]"
    >
      <Marker
        position={[lat, lng]}
        icon={mode === "shop" ? shopIcon : homeIcon}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const p = e.target.getLatLng();
            onChange(p.lat, p.lng);
          },
        }}
      >
        <Popup>{mode === "shop" ? "หมุดร้าน" : "จุดส่ง"}</Popup>
      </Marker>
    </BaseMap>
  );
}

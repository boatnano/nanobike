"use client";

import { useEffect, useMemo } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import type { NearbyRiderPin, ShopResult } from "@/app/customer/actions";
import { BaseMap, riderIcon, shopIcon } from "@/components/map/BaseMap";
import L from "leaflet";

const selectedShopIcon = L.divIcon({
  className: "",
  html: `<div style="background:#b8f26d;color:#111;border:2px solid #111;border-radius:999px;padding:3px 8px;font-size:13px;font-weight:800;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.3)">🏪 ร้านที่เลือก</div>`,
  iconSize: [90, 28],
  iconAnchor: [45, 14],
});

const softShopIcon = L.divIcon({
  className: "",
  html: `<div style="background:#fff;color:#111;border:1.5px solid #999;border-radius:999px;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:10px;box-shadow:0 1px 3px rgba(0,0,0,.2)">🏪</div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function FocusOn({
  center,
  zoom,
  focusKey,
}: {
  center: { lat: number; lng: number };
  zoom: number;
  focusKey: string;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom, { animate: true });
  }, [map, center.lat, center.lng, zoom, focusKey]);
  return null;
}

export function ShopExploreMap({
  shops,
  selectedShopId,
  riders,
  onSelectShop,
}: {
  shops: ShopResult[];
  selectedShopId: string | null;
  riders: NearbyRiderPin[];
  onSelectShop: (shop: ShopResult) => void;
}) {
  const selected = useMemo(
    () => shops.find((s) => s.id === selectedShopId) ?? null,
    [shops, selectedShopId],
  );

  const center = selected
    ? { lat: selected.lat, lng: selected.lng }
    : { lat: 13.4145, lng: 100.0025 };

  const fitPoints = selected
    ? [
        { lat: selected.lat, lng: selected.lng },
        ...riders.map((r) => ({ lat: r.lat, lng: r.lng })),
      ]
    : shops.map((s) => ({ lat: s.lat, lng: s.lng }));

  return (
    <BaseMap
      center={center}
      zoom={selected ? 14 : 12}
      points={selected ? [] : fitPoints}
      className="h-[420px] w-full overflow-hidden rounded-2xl border border-[var(--line)]"
    >
      {selected ? (
        <FocusOn
          center={{ lat: selected.lat, lng: selected.lng }}
          zoom={14}
          focusKey={selected.id}
        />
      ) : null}

      {shops.map((shop) => {
        const isSelected = shop.id === selectedShopId;
        return (
          <Marker
            key={shop.id}
            position={[shop.lat, shop.lng]}
            icon={isSelected ? selectedShopIcon : softShopIcon}
            zIndexOffset={isSelected ? 1000 : 0}
            eventHandlers={{
              click: () => onSelectShop(shop),
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{shop.name}</p>
                {shop.address ? (
                  <p className="text-xs text-gray-600">{shop.address}</p>
                ) : null}
                <button
                  type="button"
                  className="mt-1 underline"
                  onClick={() => onSelectShop(shop)}
                >
                  เลือกร้านนี้
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {riders.map((rider) => (
        <Marker
          key={rider.riderId}
          position={[rider.lat, rider.lng]}
          icon={riderIcon}
          zIndexOffset={800}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{rider.displayName}</p>
              <p>ห่างร้าน ~{rider.kmToShop.toFixed(1)} กม.</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </BaseMap>
  );
}

// keep shopIcon import used for type compatibility / tree
void shopIcon;

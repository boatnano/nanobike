"use client";

import { googleMapsNavHref } from "@/lib/maps-nav";

export function NavigateToShopButton({
  lat,
  lng,
  shopName,
}: {
  lat: number;
  lng: number;
  shopName?: string;
}) {
  return (
    <a
      href={googleMapsNavHref(lat, lng)}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 flex w-full items-center justify-center rounded-xl bg-[var(--ink)] px-3 py-3 text-sm font-semibold text-white"
    >
      นำทางไปร้าน{shopName ? ` · ${shopName}` : ""} (Google Maps)
    </a>
  );
}

export function NavigateToDropoffButton({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
}) {
  return (
    <a
      href={googleMapsNavHref(lat, lng)}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 flex w-full items-center justify-center rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm font-semibold"
    >
      นำทางไปจุดส่งลูกค้า (Google Maps)
    </a>
  );
}

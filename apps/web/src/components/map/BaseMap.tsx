"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pinIcon = (label: string, color: string) =>
  L.divIcon({
    className: "",
    html: `<div style="background:${color};color:#111;border:2px solid #111;border-radius:999px;padding:2px 6px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.25)">${label}</div>`,
    iconSize: [40, 24],
    iconAnchor: [20, 12],
  });

export const shopIcon = pinIcon("🏪", "#f5f0e6");
export const homeIcon = pinIcon("🏠", "#dbeafe");
export const riderIcon = pinIcon("🛵", "#b8f26d");
export const selfIcon = pinIcon("ฉัน", "#b8f26d");

function FitBounds({
  points,
}: {
  points: { lat: number; lng: number }[];
}) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 15);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds.pad(0.2));
  }, [map, points]);
  return null;
}

function ClickCapture({
  onPick,
}: {
  onPick?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function BaseMap({
  center,
  zoom = 14,
  points = [],
  onPick,
  children,
  className = "h-72 w-full rounded-2xl",
}: {
  center: { lat: number; lng: number };
  zoom?: number;
  points?: { lat: number; lng: number }[];
  onPick?: (lat: number, lng: number) => void;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      className={className}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points.length ? points : [center]} />
      {onPick ? <ClickCapture onPick={onPick} /> : null}
      {children}
    </MapContainer>
  );
}

export { Marker, Popup };

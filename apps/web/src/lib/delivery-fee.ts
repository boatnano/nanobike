import { DELIVERY } from "./constants";

const EARTH_RADIUS_KM = 6371;

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

async function osrmKm(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): Promise<number | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      routes?: { distance: number }[];
    };
    const meters = data.routes?.[0]?.distance;
    if (typeof meters !== "number") return null;
    return meters / 1000;
  } catch {
    return null;
  }
}

export type FeeBreakdown = {
  kmRiderToShop: number;
  kmShopToCustomer: number;
  kmOneWay: number;
  kmBillable: number;
  rawFee: number;
  deliveryFee: number;
  distanceSource: "road" | "straight";
  usedMinFee: boolean;
};

export async function calculateDeliveryFee(input: {
  rider: { lat: number; lng: number };
  shop: { lat: number; lng: number };
  dropoff: { lat: number; lng: number };
}): Promise<FeeBreakdown> {
  const roadA = await osrmKm(input.rider, input.shop);
  const roadB = await osrmKm(input.shop, input.dropoff);
  let kmRiderToShop: number;
  let kmShopToCustomer: number;
  let distanceSource: "road" | "straight";

  if (roadA != null && roadB != null) {
    kmRiderToShop = roadA;
    kmShopToCustomer = roadB;
    distanceSource = "road";
  } else {
    kmRiderToShop = haversineKm(input.rider, input.shop);
    kmShopToCustomer = haversineKm(input.shop, input.dropoff);
    distanceSource = "straight";
  }

  const kmOneWay = kmRiderToShop + kmShopToCustomer;
  const kmBillable = kmOneWay * DELIVERY.roundTripFactor;
  const rawFee = Math.ceil(kmBillable * DELIVERY.ratePerKm);
  const deliveryFee = Math.max(rawFee, DELIVERY.minFeeBaht);

  return {
    kmRiderToShop: round3(kmRiderToShop),
    kmShopToCustomer: round3(kmShopToCustomer),
    kmOneWay: round3(kmOneWay),
    kmBillable: round3(kmBillable),
    rawFee,
    deliveryFee,
    distanceSource,
    usedMinFee: deliveryFee === DELIVERY.minFeeBaht && rawFee < DELIVERY.minFeeBaht,
  };
}

function round3(n: number) {
  return Math.round(n * 1000) / 1000;
}

export function formatFeeLabel(fee: number) {
  return `${fee}฿`;
}

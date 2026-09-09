"use server";

import { revalidatePath } from "next/cache";
import { requireCustomerActor } from "@/lib/auth";
import { TIMEOUTS } from "@/lib/constants";
import { calculateDeliveryFee, haversineKm } from "@/lib/delivery-fee";

export type ShopResult = {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  keywords: string | null;
};

export type RiderFeeOption = {
  riderId: string;
  displayName: string;
  lat: number;
  lng: number;
  ratingAvg: number;
  ratingCount: number;
  locationAgeSec: number;
  kmToShop: number;
  deliveryFee: number;
  distanceSource: "road" | "straight";
  usedMinFee: boolean;
  kmRiderToShop: number;
  kmShopToCustomer: number;
  kmBillable: number;
};

export async function listApprovedShops(): Promise<ShopResult[]> {
  const { supabase } = await requireCustomerActor();
  const { data, error } = await supabase
    .from("shops")
    .select("id, name, address, lat, lng, keywords")
    .eq("status", "approved")
    .order("name")
    .limit(300);

  if (error) throw new Error(error.message);
  return (data ?? []) as ShopResult[];
}

export async function searchApprovedShops(query: string): Promise<ShopResult[]> {
  const { supabase } = await requireCustomerActor();
  const q = query.trim();

  let req = supabase
    .from("shops")
    .select("id, name, address, lat, lng, keywords")
    .eq("status", "approved")
    .order("name")
    .limit(q ? 12 : 30);

  if (q) {
    req = req.or(`name.ilike.%${q}%,address.ilike.%${q}%,keywords.ilike.%${q}%`);
  }

  const { data, error } = await req;
  if (error) throw new Error(error.message);
  return (data ?? []) as ShopResult[];
}

export type NearbyRiderPin = {
  riderId: string;
  displayName: string;
  lat: number;
  lng: number;
  kmToShop: number;
  locationAgeSec: number;
};

export async function listNearbyRidersAroundShop(input: {
  shopLat: number;
  shopLng: number;
}): Promise<NearbyRiderPin[]> {
  const { supabase } = await requireCustomerActor();

  const { data: riders, error } = await supabase
    .from("rider_profiles")
    .select(
      "user_id, profiles!inner(full_name, account_status)",
    )
    .eq("approval_status", "approved")
    .eq("is_available", true)
    .eq("profiles.account_status", "active");

  if (error) throw new Error(error.message);
  if (!riders?.length) return [];

  const ids = riders.map((r) => r.user_id);
  const { data: locs, error: locError } = await supabase
    .from("rider_locations")
    .select("rider_id, lat, lng, updated_at")
    .in("rider_id", ids);

  if (locError) throw new Error(locError.message);
  const locMap = new Map((locs ?? []).map((l) => [l.rider_id, l] as const));
  const shop = { lat: input.shopLat, lng: input.shopLng };
  const now = Date.now();

  type Row = {
    user_id: string;
    profiles:
      | { full_name: string; account_status: string }
      | { full_name: string; account_status: string }[];
  };

  return (riders as Row[])
    .map((row) => {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      const loc = locMap.get(row.user_id);
      if (!profile || !loc) return null;
      return {
        riderId: row.user_id,
        displayName: profile.full_name,
        lat: loc.lat,
        lng: loc.lng,
        kmToShop: haversineKm({ lat: loc.lat, lng: loc.lng }, shop),
        locationAgeSec: Math.max(
          0,
          Math.floor((now - new Date(loc.updated_at).getTime()) / 1000),
        ),
      };
    })
    .filter((x): x is NearbyRiderPin => x != null)
    .sort((a, b) => a.kmToShop - b.kmToShop)
    .slice(0, 20);
}

export async function listNearbyRidersWithFees(input: {
  shopLat: number;
  shopLng: number;
  dropoffLat: number;
  dropoffLng: number;
}): Promise<RiderFeeOption[]> {
  const { supabase } = await requireCustomerActor();

  const { data: riders, error } = await supabase
    .from("rider_profiles")
    .select(
      "user_id, rating_avg, rating_count, profiles!inner(full_name, account_status)",
    )
    .eq("approval_status", "approved")
    .eq("is_available", true)
    .eq("profiles.account_status", "active");

  if (error) throw new Error(error.message);
  if (!riders?.length) return [];

  const ids = riders.map((r) => r.user_id);
  const { data: locs, error: locError } = await supabase
    .from("rider_locations")
    .select("rider_id, lat, lng, updated_at")
    .in("rider_id", ids);

  if (locError) throw new Error(locError.message);

  const locMap = new Map(
    (locs ?? []).map((l) => [l.rider_id, l] as const),
  );

  type RiderRow = {
    user_id: string;
    rating_avg: number | string;
    rating_count: number;
    profiles:
      | { full_name: string; account_status: string }
      | { full_name: string; account_status: string }[];
  };

  const shop = { lat: input.shopLat, lng: input.shopLng };
  const dropoff = { lat: input.dropoffLat, lng: input.dropoffLng };
  const now = Date.now();

  const candidates = (riders as RiderRow[])
    .map((row) => {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      const loc = locMap.get(row.user_id);
      if (!profile || !loc) return null;
      return {
        riderId: row.user_id,
        displayName: profile.full_name,
        lat: loc.lat,
        lng: loc.lng,
        ratingAvg: Number(row.rating_avg ?? 0),
        ratingCount: row.rating_count ?? 0,
        locationAgeSec: Math.max(
          0,
          Math.floor((now - new Date(loc.updated_at).getTime()) / 1000),
        ),
        kmToShop: haversineKm({ lat: loc.lat, lng: loc.lng }, shop),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x != null)
    .sort((a, b) => a.kmToShop - b.kmToShop)
    .slice(0, 12);

  const withFees = await Promise.all(
    candidates.map(async (c) => {
      const fee = await calculateDeliveryFee({
        rider: { lat: c.lat, lng: c.lng },
        shop,
        dropoff,
      });
      return {
        ...c,
        deliveryFee: fee.deliveryFee,
        distanceSource: fee.distanceSource,
        usedMinFee: fee.usedMinFee,
        kmRiderToShop: fee.kmRiderToShop,
        kmShopToCustomer: fee.kmShopToCustomer,
        kmBillable: fee.kmBillable,
      } satisfies RiderFeeOption;
    }),
  );

  return withFees.sort(
    (a, b) => a.deliveryFee - b.deliveryFee || a.kmToShop - b.kmToShop,
  );
}

export async function createJob(input: {
  shopId?: string | null;
  shopName: string;
  shopLat: number;
  shopLng: number;
  dropoffLat: number;
  dropoffLng: number;
  dropoffAddress: string;
  shoppingList: string;
  goodsBudget?: number | null;
  riderId: string;
  preferTransferToShop?: boolean;
}) {
  const { supabase, profile } = await requireCustomerActor();

  if (!input.shoppingList.trim()) throw new Error("กรุณากรอกรายการฝากซื้อ");
  if (!input.dropoffAddress.trim()) throw new Error("กรุณาระบุที่อยู่จุดส่ง");
  if (!input.riderId) throw new Error("กรุณาเลือกไรเดอร์");

  const { data: riderLoc, error: locError } = await supabase
    .from("rider_locations")
    .select("lat, lng")
    .eq("rider_id", input.riderId)
    .maybeSingle();
  if (locError) throw new Error(locError.message);
  if (!riderLoc) throw new Error("ไม่พบพิกัดไรเดอร์");

  const { data: riderProfile } = await supabase
    .from("rider_profiles")
    .select("approval_status, is_available")
    .eq("user_id", input.riderId)
    .maybeSingle();
  if (
    !riderProfile ||
    riderProfile.approval_status !== "approved" ||
    !riderProfile.is_available
  ) {
    throw new Error("ไรเดอร์คนนี้ยังไม่พร้อมรับงาน");
  }

  const fee = await calculateDeliveryFee({
    rider: { lat: riderLoc.lat, lng: riderLoc.lng },
    shop: { lat: input.shopLat, lng: input.shopLng },
    dropoff: { lat: input.dropoffLat, lng: input.dropoffLng },
  });

  const acceptDeadline = new Date(
    Date.now() + TIMEOUTS.acceptSec * 1000,
  ).toISOString();

  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      customer_id: profile.id,
      rider_id: input.riderId,
      shop_id: input.shopId || null,
      shop_name: input.shopName.trim(),
      shop_lat: input.shopLat,
      shop_lng: input.shopLng,
      dropoff_lat: input.dropoffLat,
      dropoff_lng: input.dropoffLng,
      dropoff_address: input.dropoffAddress.trim(),
      dropoff_confirmed: true,
      shopping_list: input.shoppingList.trim(),
      goods_budget: input.goodsBudget ?? null,
      prefer_transfer_to_shop: input.preferTransferToShop ?? false,
      km_rider_to_shop: fee.kmRiderToShop,
      km_shop_to_customer: fee.kmShopToCustomer,
      km_billable: fee.kmBillable,
      delivery_fee: fee.deliveryFee,
      distance_source: fee.distanceSource,
      status: "pending_rider",
      accept_deadline_at: acceptDeadline,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("job_events").insert({
    job_id: job.id,
    actor_id: profile.id,
    event_type: "job_created",
    payload: {
      rider_id: input.riderId,
      delivery_fee: fee.deliveryFee,
      distance_source: fee.distanceSource,
    },
  });

  revalidatePath("/customer/jobs");
  revalidatePath("/rider/jobs");
  return { jobId: job.id as string };
}

const fs = require("fs");
const raw = JSON.parse(fs.readFileSync("tmp-osm-shops.json", "utf8"));

const KEEP = new Set([
  "convenience",
  "supermarket",
  "marketplace",
  "restaurant",
  "cafe",
  "fast_food",
  "bakery",
  "butcher",
  "seafood",
  "greengrocer",
  "variety_store",
  "department_store",
  "mall",
  "confectionery",
  "general",
  "kiosk",
  "pastry",
  "tea",
  "coffee",
  "food",
  "grocery",
]);

function coords(e) {
  return { lat: e.lat ?? e.center?.lat, lng: e.lon ?? e.center?.lon };
}

const named = (raw.elements || [])
  .map((e) => {
    const c = coords(e);
    const t = e.tags || {};
    if (!t.name || c.lat == null || c.lng == null) return null;
    const kind = t.shop || t.amenity || "";
    if (kind && !KEEP.has(kind) && kind !== "yes") return null;
    const name = t.name.trim();
    // skip courier meet-up / laundry style noise
    if (/วิคซอ|vitso|vlxo|ซักผ้า|honda|mazda|kia|mitsubishi/i.test(name + kind)) {
      return null;
    }
    if (["car", "motorcycle", "massage", "furniture", "hardware", "doityourself", "electronics", "clothes", "gift", "pottery", "stationery", "wholesale"].includes(kind)) {
      return null;
    }
    const street = t["addr:street"] || t["addr:place"] || "";
    const keywords = [kind, t.brand, t.cuisine, name, street].filter(Boolean).join(" ");
    return {
      name,
      street,
      address: street ? `${street}, สมุทรสงคราม` : "สมุทรสงคราม",
      lat: +c.lat,
      lng: +c.lng,
      keywords,
      kind,
    };
  })
  .filter(Boolean);

const byName = new Map();
for (const s of named) {
  const key = s.name.toLowerCase();
  if (!byName.has(key)) byName.set(key, []);
  byName.get(key).push(s);
}

const final = [];
for (const group of byName.values()) {
  group.sort((a, b) => a.lat - b.lat || a.lng - b.lng);
  group.forEach((s, i) => {
    let name = s.name;
    if (group.length > 1) {
      name = s.street ? `${s.name} (${s.street})` : `${s.name} #${i + 1}`;
    }
    final.push({ ...s, name });
  });
}

final.sort((a, b) => a.name.localeCompare(b.name, "th"));

function esc(s) {
  return String(s).replace(/'/g, "''");
}

const values = final
  .map(
    (s) =>
      `('${esc(s.name)}','${esc(s.address)}',${s.lat},${s.lng},'${esc(s.keywords)}','approved')`,
  )
  .join(",\n  ");

const sql = `-- Seed food/grocery/convenience shops from OpenStreetMap (Mae Klong area).
-- Source: OSM via Overpass (open data). Not scraped from Google Maps.
insert into public.shops (name, address, lat, lng, keywords, status)
select v.name, v.address, v.lat, v.lng, v.keywords, v.status::public.approval_status
from (values
  ${values}
) as v(name, address, lat, lng, keywords, status)
where not exists (
  select 1 from public.shops s
  where abs(s.lat - v.lat) < 0.0003 and abs(s.lng - v.lng) < 0.0003
);
`;

fs.writeFileSync(
  "supabase/migrations/20260909150000_seed_osm_shops_samut.sql",
  sql,
  "utf8",
);
console.log("shops", final.length);
console.log(final.slice(0, 15).map((s) => s.name).join("\n"));

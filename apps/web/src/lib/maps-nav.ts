/** Open Google Maps navigation to lat/lng (opens app on phone when available). */
export function openGoogleMapsNavigation(lat: number, lng: number) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving&dir_action=navigate`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function googleMapsNavHref(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving&dir_action=navigate`;
}

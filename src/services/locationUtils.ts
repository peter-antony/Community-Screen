/**
 * Utility for user location retrieval and Haversine distance calculation
 */

export interface LatLng {
  lat: number;
  lng: number;
}

const DEFAULT_LOCATION_COORDS: Record<string, LatLng> = {
  koramangala: { lat: 12.9348, lng: 77.6254 },
  indiranagar: { lat: 12.9784, lng: 77.6408 },
  cubbon: { lat: 12.9763, lng: 77.5929 },
  'jp nagar': { lat: 12.9105, lng: 77.5958 },
  hsr: { lat: 12.9116, lng: 77.6474 },
  jayanagar: { lat: 12.9250, lng: 77.5938 },
  whitefield: { lat: 12.9866, lng: 77.7381 },
  btm: { lat: 12.9166, lng: 77.6101 },
  'mg road': { lat: 12.9756, lng: 77.6015 },
  ulsoor: { lat: 12.9831, lng: 77.6210 },
  'electronic city': { lat: 12.8452, lng: 77.6602 },
  malleshwaram: { lat: 12.9984, lng: 77.5709 },
  rajajinagar: { lat: 12.9880, lng: 77.5540 },
  bellandur: { lat: 12.9279, lng: 77.6806 },
  hebbal: { lat: 13.0358, lng: 77.5970 },
  marathahalli: { lat: 12.9592, lng: 77.6974 },
};

// Default fallback location (e.g. Bangalore center) if Geolocation API fails
export const DEFAULT_USER_LOCATION: LatLng = { lat: 12.9716, lng: 77.5946 };

/**
 * Calculates the Haversine distance in kilometers between two lat/lng coordinates
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): string {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return '';
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m away`;
  }
  return `${distance.toFixed(1)} km away`;
}

/**
 * Resolves community coordinates from its object properties or location name fallback
 */
export function resolveCommunityCoordinates(community: any): LatLng {
  if (community && community.lat != null && community.lng != null && !isNaN(Number(community.lat)) && !isNaN(Number(community.lng))) {
    return { lat: Number(community.lat), lng: Number(community.lng) };
  }

  const searchString = [
    community?.locationName,
    community?.location_name,
    community?.location,
    community?.name
  ].filter(Boolean).join(' ').toLowerCase();

  for (const [key, coords] of Object.entries(DEFAULT_LOCATION_COORDS)) {
    if (searchString.includes(key)) {
      return coords;
    }
  }

  return { lat: 12.9105, lng: 77.5958 }; // Fallback to JP Nagar coordinates
}

/**
 * Requests the user's current browser geolocation
 */
export function getUserCurrentLocation(): Promise<LatLng> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve(DEFAULT_USER_LOCATION);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.warn('Geolocation position unavailable or denied, using fallback location:', error);
        resolve(DEFAULT_USER_LOCATION);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}

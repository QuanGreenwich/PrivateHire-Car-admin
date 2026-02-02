// Routing utilities using OSRM (Open Source Routing Machine)

export interface RoutePoint {
  longitude: number;
  latitude: number;
  name?: string;
}

export interface RouteResult {
  coordinates: [number, number][];
  distance: number; // meters
  duration: number; // seconds
  price: number; // GBP
}

/**
 * Calculate route between two points using OSRM API
 */
export async function calculateRoute(
  start: RoutePoint,
  end: RoutePoint,
  vehicleType: 'standard' | 'executive' | 'luxury' = 'standard'
): Promise<RouteResult> {
  try {
    // OSRM demo server - request full geometry with alternatives
    const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson&alternatives=true`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    // Use the first (fastest) route
    const route = data.routes[0];
    const coordinates = route.geometry.coordinates as [number, number][];
    const distance = route.distance; // meters
    const duration = route.duration; // seconds

    // Calculate price based on distance and vehicle type
    const price = calculatePrice(distance, duration, vehicleType);

    return {
      coordinates,
      distance,
      duration,
      price
    };
  } catch (error) {
    console.error('Routing error:', error);
    // Fallback to straight line if API fails
    return {
      coordinates: [[start.longitude, start.latitude], [end.longitude, end.latitude]],
      distance: calculateStraightLineDistance(start, end),
      duration: 0,
      price: 0
    };
  }
}

/**
 * Calculate price based on distance, duration, and vehicle type
 * Pricing model:
 * - Base fare: £3.50
 * - Per mile: £2.50 (Standard), £3.50 (Executive), £4.50 (Luxury)
 * - Per minute: £0.30
 * - Minimum fare: £8.00
 */
function calculatePrice(distanceMeters: number, durationSeconds: number, vehicleType: 'standard' | 'executive' | 'luxury'): number {
  const distanceMiles = distanceMeters / 1609.34; // meters to miles
  const durationMinutes = durationSeconds / 60;

  const baseFare = 3.50;
  const perMileRate = vehicleType === 'standard' ? 2.50 : vehicleType === 'executive' ? 3.50 : 4.50;
  const perMinuteRate = 0.30;
  const minimumFare = 8.00;

  const price = baseFare + (distanceMiles * perMileRate) + (durationMinutes * perMinuteRate);

  return Math.max(price, minimumFare);
}

/**
 * Calculate straight-line distance between two points (Haversine formula)
 */
function calculateStraightLineDistance(point1: RoutePoint, point2: RoutePoint): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = point1.latitude * Math.PI / 180;
  const φ2 = point2.latitude * Math.PI / 180;
  const Δφ = (point2.latitude - point1.latitude) * Math.PI / 180;
  const Δλ = (point2.longitude - point1.longitude) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // meters
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  const miles = meters / 1609.34;
  if (miles < 0.1) {
    return `${Math.round(meters)} m`;
  }
  return `${miles.toFixed(1)} miles`;
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return `£${price.toFixed(2)}`;
}

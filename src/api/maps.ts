import { GOOGLE_MAPS_API_KEY } from '../config/maps';

export type PlaceSuggestion = {
  id: string;
  description: string;
};

export type LocationPoint = {
  lat: number;
  lng: number;
  description: string;
};

export type PlaceDetails = LocationPoint;

const PLACES_AUTOCOMPLETE =
  'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const PLACE_DETAILS =
  'https://maps.googleapis.com/maps/api/place/details/json';

export async function fetchPlaceSuggestions(
  query: string
): Promise<PlaceSuggestion[]> {
  if (!GOOGLE_MAPS_API_KEY || query.length < 3) return [];
  const params = new URLSearchParams({
    input: query,
    key: GOOGLE_MAPS_API_KEY,
    types: 'establishment|geocode',
  });
  const res = await fetch(`${PLACES_AUTOCOMPLETE}?${params.toString()}`);
  const data = await res.json();
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') return [];
  const predictions = data.predictions ?? [];
  return predictions.map((p: { place_id: string; description: string }) => ({
    id: p.place_id,
    description: p.description,
  }));
}

export async function fetchPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  if (!GOOGLE_MAPS_API_KEY) return null;
  const params = new URLSearchParams({
    place_id: placeId,
    key: GOOGLE_MAPS_API_KEY,
    fields: 'geometry,formatted_address',
  });
  const res = await fetch(`${PLACE_DETAILS}?${params.toString()}`);
  const data = await res.json();
  if (data.status !== 'OK' || !data.result?.geometry?.location) return null;
  const loc = data.result.geometry.location;
  return {
    lat: loc.lat,
    lng: loc.lng,
    description: data.result.formatted_address ?? '',
  };
}

// Decode Google Maps polyline
function decodePolyline(encoded: string): Array<{ latitude: number; longitude: number }> {
  const poly: Array<{ latitude: number; longitude: number }> = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    poly.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return poly;
}

export async function fetchDirectionsRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  waypoints?: Array<{ lat: number; lng: number }>
): Promise<Array<{ latitude: number; longitude: number }>> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('No Google Maps API key provided');
    return [];
  }

  try {
    const originStr = `${origin.lat},${origin.lng}`;
    const destinationStr = `${destination.lat},${destination.lng}`;
    const waypointsStr = waypoints
      ? waypoints.map(w => `${w.lat},${w.lng}`).join('|')
      : '';

    const url = waypointsStr
      ? `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&waypoints=${waypointsStr}&key=${GOOGLE_MAPS_API_KEY}`
      : `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&key=${GOOGLE_MAPS_API_KEY}`;

    console.log('Fetching route from:', url.replace(GOOGLE_MAPS_API_KEY, 'API_KEY'));

    const response = await fetch(url);
    const data = await response.json();

    console.log('Directions API response status:', data.status);

    if (data.status === 'OK' && data.routes && data.routes.length > 0) {
      const points = decodePolyline(data.routes[0].overview_polyline.points);
      console.log(`Decoded ${points.length} route points`);
      return points;
    } else {
      console.error('Directions API error:', data.status, data.error_message);
      return [];
    }
  } catch (error) {
    console.error('Error fetching directions:', error);
    return [];
  }
}

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

const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

if (!key && typeof __DEV__ !== 'undefined' && __DEV__) {
  console.warn(
    '[maps] EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is not set. Places autocomplete will be disabled.'
  );
}

export const GOOGLE_MAPS_API_KEY = key ?? '';

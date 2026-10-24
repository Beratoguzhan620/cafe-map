import type { ConfigContext, ExpoConfig } from "expo/config";

// Google Maps needs an API key on Android. Keep it out of git: put it in .env as
// GOOGLE_MAPS_API_KEY=... (see .env.example). Apple Maps on iOS needs no key.
// EXPO_BASE_URL serves the web build from a sub-path, e.g. /cafe-map on GitHub Pages.
export default ({ config }: ConfigContext): ExpoConfig => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const baseUrl = process.env.EXPO_BASE_URL;
  return {
    ...config,
    ...(baseUrl ? { experiments: { ...config.experiments, baseUrl } } : {}),
    name: config.name ?? "CafeMap",
    slug: config.slug ?? "cafe-map",
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        ...(apiKey ? { googleMaps: { apiKey } } : {}),
      },
    },
  };
};

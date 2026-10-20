import data from "../data/cafes.json";

export type Cafe = {
  id: string;
  name: string;
  neighbourhood: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  /** 0–5, one decimal. */
  rating: number;
  /** 1 (cheap) to 3 (pricey). */
  priceLevel: 1 | 2 | 3;
  openingHours: string;
  tags: string[];
  description: string;
  /** File name under assets/cafes. */
  image: string;
};

export type Camera = {
  latitude: number;
  longitude: number;
  zoom: number;
};

export const cafes = data as Cafe[];

/** Centre of the bounding box around the given cafes, with a zoom that fits them on a phone screen. */
export function cameraFor(list: readonly Cafe[]): Camera {
  if (list.length === 0) return { latitude: 41.0082, longitude: 28.9784, zoom: 11 };
  const lats = list.map((c) => c.latitude);
  const lngs = list.map((c) => c.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const span = Math.max(maxLat - minLat, maxLng - minLng);
  // Web Mercator: the world is 256 × 2^zoom px wide, so at zoom log2(360 / span) the
  // span takes ~256px — about two thirds of a phone screen.
  const zoom = span === 0 ? 15 : Math.min(15, Math.max(3, Math.round(Math.log2(360 / span))));
  return {
    latitude: round((minLat + maxLat) / 2),
    longitude: round((minLng + maxLng) / 2),
    zoom,
  };
}

export function priceLabel(level: Cafe["priceLevel"]): string {
  return "₺".repeat(level);
}

const round = (value: number) => Math.round(value * 1e5) / 1e5;

/** Lower-cases with Turkish rules and strips accents, so "kadikoy" finds "Kadıköy" and "İSTANBUL" finds "istanbul". */
export function normalize(text: string): string {
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Cafes whose name, neighbourhood, district or tags contain every word of the query. */
export function searchCafes(list: readonly Cafe[], query: string): Cafe[] {
  const words = normalize(query).split(" ").filter(Boolean);
  if (words.length === 0) return [...list];
  return list.filter((cafe) => {
    const haystack = normalize([cafe.name, cafe.neighbourhood, cafe.district, ...cafe.tags].join(" "));
    return words.every((word) => haystack.includes(word));
  });
}

export const FOCUS_ZOOM = 15;

/**
 * Camera on a single cafe. `offsetPx` moves the cafe that many screen pixels up from the
 * centre, so it stays visible above the bottom sheet.
 */
export function focusCamera(cafe: Cafe, offsetPx = 0, zoom = FOCUS_ZOOM): Camera {
  const degreesPerPx = 360 / (256 * 2 ** zoom);
  const latitudeShift = offsetPx * degreesPerPx * Math.cos((cafe.latitude * Math.PI) / 180);
  return { latitude: round(cafe.latitude - latitudeShift), longitude: cafe.longitude, zoom };
}

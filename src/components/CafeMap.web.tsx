import "leaflet/dist/leaflet.css";
import "./cafe-map.web.css";

import L from "leaflet";
import { useMemo } from "react";
import { AttributionControl, MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";

import type { CafeMapProps } from "./CafeMap.types";

const TILES = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Small cup glyph (Lucide "coffee", MIT) drawn inside the pin.
const CUP =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/></svg>';

const pin = (selected: boolean) =>
  L.divIcon({
    className: selected ? "cm-pin cm-pin--selected" : "cm-pin",
    html: `<span class="cm-pin__body">${CUP}</span>`,
    iconSize: [32, 40],
    iconAnchor: [16, 38],
    tooltipAnchor: [0, -36],
  });

/** Web fallback: expo-maps has no web support, so the web build uses Leaflet with CARTO tiles. */
export function CafeMap({ cafes, initialCamera, selectedId, onSelect, dark }: CafeMapProps) {
  const icons = useMemo(() => ({ normal: pin(false), selected: pin(true) }), []);

  return (
    <MapContainer
      className="cm-map"
      center={[initialCamera.latitude, initialCamera.longitude]}
      zoom={initialCamera.zoom}
      zoomControl={false}
      attributionControl={false}
    >
      <AttributionControl position="bottomright" prefix="Leaflet" />
      <TileLayer key={dark ? "dark" : "light"} url={dark ? TILES.dark : TILES.light} attribution={ATTRIBUTION} />
      {cafes.map((cafe) => (
        <Marker
          key={cafe.id}
          position={[cafe.latitude, cafe.longitude]}
          icon={cafe.id === selectedId ? icons.selected : icons.normal}
          title={cafe.name}
          keyboard
          eventHandlers={{ click: () => onSelect?.(cafe.id) }}
        >
          <Tooltip direction="top" className="cm-tooltip">
            {cafe.name}
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}

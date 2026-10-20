import { useImage } from "expo-image";
import { AppleMaps, GoogleMaps } from "expo-maps";
import { cssInterop } from "nativewind";
import type { ComponentProps, ComponentType, RefObject } from "react";
import { useEffect, useRef } from "react";
import { Platform, Text, View } from "react-native";

import type { CafeMapProps } from "./CafeMap.types";

cssInterop(AppleMaps.View, { className: "style" });
cssInterop(GoogleMaps.View, { className: "style" });

// expo-maps does not declare className; cssInterop above maps it to style.
const AppleMapView = AppleMaps.View as ComponentType<ComponentProps<typeof AppleMaps.View> & { className?: string }>;
const GoogleMapView = GoogleMaps.View as ComponentType<ComponentProps<typeof GoogleMaps.View> & { className?: string }>;

const ACCENT = "#7A5230";
const INK = "#1F2A37";
const CAMERA_ANIMATION_MS = 600;

const toPosition = ({ latitude, longitude, zoom }: CafeMapProps["camera"]) => ({
  coordinates: { latitude, longitude },
  zoom,
});

type Movable = { setCameraPosition: (config: ReturnType<typeof toPosition> & { duration?: number }) => Promise<void> };

/** Moves the map whenever the requested camera changes (not on the first render). */
function useCamera(camera: CafeMapProps["camera"], ref: RefObject<Movable | null>, duration?: number) {
  const first = useRef(true);
  const { latitude, longitude, zoom } = camera;
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    ref.current?.setCameraPosition({ ...toPosition({ latitude, longitude, zoom }), duration }).catch(() => {});
  }, [ref, latitude, longitude, zoom, duration]);
}

function AppleCafeMap({ cafes, initialCamera, camera, selectedId, onSelect, dark }: CafeMapProps) {
  const ref = useRef<AppleMaps.MapView>(null);
  // Apple Maps animates on its own; it does not take a duration.
  useCamera(camera, ref);

  return (
    <AppleMapView
      ref={ref}
      className="flex-1"
      cameraPosition={toPosition(initialCamera)}
      colorScheme={dark ? AppleMaps.MapColorScheme.DARK : AppleMaps.MapColorScheme.LIGHT}
      uiSettings={{ myLocationButtonEnabled: false, togglePitchEnabled: false }}
      markers={cafes.map((cafe) => ({
        id: cafe.id,
        title: cafe.name,
        coordinates: { latitude: cafe.latitude, longitude: cafe.longitude },
        systemImage: "cup.and.saucer.fill",
        tintColor: cafe.id === selectedId ? INK : ACCENT,
      }))}
      onMarkerClick={(marker) => marker.id && onSelect?.(marker.id)}
    />
  );
}

function GoogleCafeMap({ cafes, initialCamera, camera, selectedId, onSelect, dark }: CafeMapProps) {
  const ref = useRef<GoogleMaps.MapView>(null);
  const pin = useImage(require("../../assets/pins/pin.png"));
  const selectedPin = useImage(require("../../assets/pins/pin-selected.png"));
  useCamera(camera, ref, CAMERA_ANIMATION_MS);

  return (
    <GoogleMapView
      ref={ref}
      className="flex-1"
      cameraPosition={toPosition(initialCamera)}
      colorScheme={dark ? GoogleMaps.MapColorScheme.DARK : GoogleMaps.MapColorScheme.LIGHT}
      uiSettings={{ mapToolbarEnabled: false, myLocationButtonEnabled: false }}
      markers={cafes.map((cafe) => {
        const selected = cafe.id === selectedId;
        return {
          id: cafe.id,
          title: cafe.name,
          showCallout: false,
          coordinates: { latitude: cafe.latitude, longitude: cafe.longitude },
          icon: (selected ? selectedPin : pin) ?? undefined,
          zIndex: selected ? 1 : 0,
        };
      })}
      onMarkerClick={(marker) => marker.id && onSelect?.(marker.id)}
    />
  );
}

/** Native map: Apple Maps on iOS, Google Maps on Android (expo-maps, needs a development build). */
export function CafeMap(props: CafeMapProps) {
  if (Platform.OS === "ios") return <AppleCafeMap {...props} />;
  if (Platform.OS === "android") return <GoogleCafeMap {...props} />;
  return (
    <View className="flex-1 items-center justify-center bg-surface-2 dark:bg-night-surface-2">
      <Text className="font-sans text-sm text-muted dark:text-night-muted">Harita bu platformda desteklenmiyor.</Text>
    </View>
  );
}

import { AppleMaps, GoogleMaps } from "expo-maps";
import { cssInterop } from "nativewind";
import type { ComponentProps, ComponentType } from "react";
import { Platform, Text, View } from "react-native";

import type { CafeMapProps } from "./CafeMap.types";

cssInterop(AppleMaps.View, { className: "style" });
cssInterop(GoogleMaps.View, { className: "style" });

// expo-maps does not declare className; cssInterop above maps it to style.
const AppleMapView = AppleMaps.View as ComponentType<ComponentProps<typeof AppleMaps.View> & { className?: string }>;
const GoogleMapView = GoogleMaps.View as ComponentType<ComponentProps<typeof GoogleMaps.View> & { className?: string }>;

const ACCENT = "#7A5230";
const INK = "#1F2A37";

/** Native map: Apple Maps on iOS, Google Maps on Android (expo-maps, needs a development build). */
export function CafeMap({ cafes, initialCamera, selectedId, onSelect, dark }: CafeMapProps) {
  const cameraPosition = {
    coordinates: { latitude: initialCamera.latitude, longitude: initialCamera.longitude },
    zoom: initialCamera.zoom,
  };

  if (Platform.OS === "ios") {
    return (
      <AppleMapView
        className="flex-1"
        cameraPosition={cameraPosition}
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

  if (Platform.OS === "android") {
    return (
      <GoogleMapView
        className="flex-1"
        cameraPosition={cameraPosition}
        colorScheme={dark ? GoogleMaps.MapColorScheme.DARK : GoogleMaps.MapColorScheme.LIGHT}
        uiSettings={{ mapToolbarEnabled: false, myLocationButtonEnabled: false }}
        markers={cafes.map((cafe) => ({
          id: cafe.id,
          title: cafe.name,
          snippet: cafe.neighbourhood,
          coordinates: { latitude: cafe.latitude, longitude: cafe.longitude },
        }))}
        onMarkerClick={(marker) => marker.id && onSelect?.(marker.id)}
      />
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-surface-2 dark:bg-night-surface-2">
      <Text className="font-sans text-sm text-muted dark:text-night-muted">Harita bu platformda desteklenmiyor.</Text>
    </View>
  );
}

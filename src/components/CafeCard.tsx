import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import { cafeImages } from "../data/images";
import type { Cafe } from "../lib/cafes";
import type { Palette } from "../lib/theme";
import { Rating } from "./Rating";

type Props = {
  cafe: Cafe;
  active: boolean;
  onPress: () => void;
  colors: Palette;
};

export function CafeCard({ cafe, active, onPress, colors }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${cafe.name}, ${cafe.neighbourhood}`}
      accessibilityState={{ selected: active }}
      testID={`card-${cafe.id}`}
      className={`h-24 w-[300px] flex-row gap-3 rounded-card border bg-surface p-2 dark:bg-night-surface ${
        active ? "border-accent dark:border-night-accent" : "border-border dark:border-night-border"
      }`}
    >
      <Image source={cafeImages[cafe.image]} className="h-full w-20 rounded" contentFit="cover" accessibilityIgnoresInvertColors />
      <View className="flex-1 justify-center gap-1">
        <Text numberOfLines={1} className="font-semibold text-base text-ink dark:text-night-ink">
          {cafe.name}
        </Text>
        <Text numberOfLines={1} className="font-sans text-xs text-muted dark:text-night-muted">
          {cafe.neighbourhood}, {cafe.district}
        </Text>
        <Rating cafe={cafe} colors={colors} />
      </View>
    </Pressable>
  );
}

/** Card width (w-[300px]) plus the gap between cards; used to snap the carousel. */
export const CARD_INTERVAL = 312;

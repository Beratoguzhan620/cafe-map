import { Star } from "lucide-react-native";
import { Text, View } from "react-native";

import { type Cafe, priceLabel } from "../lib/cafes";
import type { Palette } from "../lib/theme";

/** "★ 4.7 · ₺₺" — rating and price level on one line. */
export function Rating({ cafe, colors }: { cafe: Cafe; colors: Palette }) {
  return (
    <View className="flex-row items-center gap-1">
      <Star size={14} color={colors.accent} fill={colors.accent} />
      <Text className="font-mono text-xs text-ink dark:text-night-ink" accessibilityLabel={`Puan ${cafe.rating}`}>
        {cafe.rating.toFixed(1)}
      </Text>
      <Text className="font-sans text-xs text-muted dark:text-night-muted"> · </Text>
      <Text className="font-sans text-xs text-muted dark:text-night-muted" accessibilityLabel={`Fiyat seviyesi ${cafe.priceLevel}/3`}>
        {priceLabel(cafe.priceLevel)}
      </Text>
    </View>
  );
}

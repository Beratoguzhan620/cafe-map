import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { Clock, MapPin, X } from "lucide-react-native";
import { cssInterop } from "nativewind";
import { type ComponentPropsWithRef, type ComponentType, useEffect, useMemo, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { cafeImages } from "../data/images";
import type { Cafe } from "../lib/cafes";
import type { Palette } from "../lib/theme";
import { Rating } from "./Rating";

type Props = {
  cafe: Cafe | null;
  onClose: () => void;
  colors: Palette;
};

const SNAP_POINTS = ["52%", "90%"];

// Lets the sheet take a className (used to keep it narrow on wide screens).
cssInterop(BottomSheet, { className: "style" });
const Sheet = BottomSheet as ComponentType<ComponentPropsWithRef<typeof BottomSheet> & { className?: string }>;

/** Detail sheet for the selected cafe. Closing it (button, swipe down) calls onClose. */
export function CafeSheet({ cafe, onClose, colors }: Props) {
  const ref = useRef<BottomSheet>(null);
  const open = cafe !== null;

  useEffect(() => {
    if (open) ref.current?.snapToIndex(0);
    else ref.current?.close();
  }, [open, cafe?.id]);

  const chrome = useMemo(
    () =>
      StyleSheet.create({
        background: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
        indicator: { backgroundColor: colors.border, width: 40 },
      }),
    [colors],
  );

  return (
    <Sheet
      ref={ref}
      index={-1}
      snapPoints={SNAP_POINTS}
      enablePanDownToClose
      enableDynamicSizing={false}
      onClose={onClose}
      backgroundStyle={chrome.background}
      handleIndicatorStyle={chrome.indicator}
      accessibilityLabel="Kafe ayrıntıları"
      className="md:mx-auto md:w-[560px]"
    >
      {cafe && (
        <BottomSheetScrollView testID="cafe-sheet">
          <View className="gap-4 px-5 pb-10 pt-1">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1 gap-1">
                <Text role="heading" className="font-semibold text-xl text-ink dark:text-night-ink">
                  {cafe.name}
                </Text>
                <Rating cafe={cafe} colors={colors} />
              </View>
              <Pressable
                onPress={() => ref.current?.close()}
                accessibilityRole="button"
                accessibilityLabel="Kapat"
                hitSlop={8}
                className="h-11 w-11 items-center justify-center rounded border border-border dark:border-night-border"
              >
                <X size={18} color={colors.ink} />
              </Pressable>
            </View>

            <Image
              source={cafeImages[cafe.image]}
              className="aspect-[16/10] w-full rounded-card"
              contentFit="cover"
              accessibilityIgnoresInvertColors
            />

            <Text className="font-sans text-base text-ink dark:text-night-ink">{cafe.description}</Text>

            <View className="flex-row flex-wrap gap-2">
              {cafe.tags.map((tag) => (
                <Text
                  key={tag}
                  className="rounded-full bg-accent-soft px-3 py-1 font-medium text-xs text-accent dark:bg-night-accent-soft dark:text-night-accent"
                >
                  {tag}
                </Text>
              ))}
            </View>

            <View className="gap-3 border-t border-border pt-4 dark:border-night-border">
              <View className="flex-row items-center gap-3">
                <MapPin size={18} color={colors.muted} />
                <Text className="flex-1 font-sans text-sm text-ink dark:text-night-ink">{cafe.address}</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Clock size={18} color={colors.muted} />
                <Text className="flex-1 font-mono text-sm text-ink dark:text-night-ink">{cafe.openingHours}</Text>
              </View>
            </View>
          </View>
        </BottomSheetScrollView>
      )}
    </Sheet>
  );
}

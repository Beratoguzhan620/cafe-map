import { StatusBar } from "expo-status-bar";
import { Coffee } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CafeCard, CARD_INTERVAL } from "../src/components/CafeCard";
import { CafeMap } from "../src/components/CafeMap";
import { CafeSheet } from "../src/components/CafeSheet";
import { SearchBar } from "../src/components/SearchBar";
import { type Cafe, cafes, cameraFor, focusCamera, searchCafes } from "../src/lib/cafes";
import { palette } from "../src/lib/theme";

const initialCamera = cameraFor(cafes);
// How long the carousel has to be still before its centred card counts as chosen.
const SCROLL_SETTLE_MS = 120;

export default function MapScreen() {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === "dark";
  const colors = dark ? palette.dark : palette.light;
  const { height } = useWindowDimensions();

  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const results = useMemo(() => searchCafes(cafes, query), [query]);
  const active: Cafe | null = results.find((cafe) => cafe.id === activeId) ?? null;

  // The camera follows the selection: the cafe sits above the sheet when it is open,
  // or above the card list while browsing; with nothing chosen it frames all results.
  const camera = useMemo(() => {
    if (active && detailOpen) return focusCamera(active, height * 0.25);
    if (active) return focusCamera(active, 60, 14);
    return cameraFor(results.length > 0 ? results : cafes);
  }, [active, detailOpen, height, results]);

  const list = useRef<FlatList<Cafe>>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => clearTimeout(settle.current ?? undefined), []);

  const scrollTo = useCallback(
    (id: string) => {
      const index = results.findIndex((cafe) => cafe.id === id);
      if (index >= 0) list.current?.scrollToOffset({ offset: index * CARD_INTERVAL, animated: true });
    },
    [results],
  );

  const openCafe = useCallback(
    (id: string) => {
      setActiveId(id);
      setDetailOpen(true);
      scrollTo(id);
    },
    [scrollTo],
  );

  const closeSheet = useCallback(() => {
    setDetailOpen(false);
    setActiveId(null);
  }, []);

  const onSearch = useCallback((value: string) => {
    setQuery(value);
    setActiveId(null);
    setDetailOpen(false);
    list.current?.scrollToOffset({ offset: 0, animated: false });
  }, []);

  // Browsing the cards moves the map to the card that ends up first in view.
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (detailOpen) return;
      const x = event.nativeEvent.contentOffset.x;
      clearTimeout(settle.current ?? undefined);
      settle.current = setTimeout(() => {
        const index = Math.min(results.length - 1, Math.max(0, Math.round(x / CARD_INTERVAL)));
        const cafe = results[index];
        if (cafe && x > 0) setActiveId(cafe.id);
      }, SCROLL_SETTLE_MS);
    },
    [detailOpen, results],
  );

  return (
    <View className="flex-1 bg-bg dark:bg-night-bg">
      <StatusBar style={dark ? "light" : "dark"} />
      <View className="flex-1" testID="map">
        <CafeMap
          cafes={results}
          initialCamera={initialCamera}
          camera={camera}
          selectedId={active?.id ?? null}
          onSelect={openCafe}
          dark={dark}
        />
      </View>

      <SafeAreaView edges={["top"]} pointerEvents="box-none" className="absolute left-0 right-0 top-0">
        <View className="mx-4 mt-2 max-w-[420px] gap-3 rounded-card border border-border bg-surface p-3 dark:border-night-border dark:bg-night-surface">
          <View className="flex-row items-center gap-3">
            <View className="h-9 w-9 items-center justify-center rounded bg-accent-soft dark:bg-night-accent-soft">
              <Coffee size={20} color={colors.accent} />
            </View>
            <View className="flex-1">
              <Text role="heading" className="font-semibold text-base text-ink dark:text-night-ink">
                CafeMap
              </Text>
              <Text className="font-sans text-xs text-muted dark:text-night-muted" testID="result-count">
                {query.trim() ? `${results.length} sonuç` : `İstanbul · ${cafes.length} kafe`}
              </Text>
            </View>
          </View>
          <SearchBar value={query} onChange={onSearch} colors={colors} />
        </View>
      </SafeAreaView>

      {/* Stays mounted under the sheet so the list keeps its scroll position. */}
      <SafeAreaView
        edges={["bottom"]}
        pointerEvents={detailOpen ? "none" : "box-none"}
        aria-hidden={detailOpen}
        testID="cafe-strip"
        className={`absolute bottom-0 left-0 right-0 ${detailOpen ? "opacity-0" : "opacity-100"}`}
      >
        {results.length > 0 ? (
          <FlatList
            ref={list}
            horizontal
            data={results}
            keyExtractor={(cafe) => cafe.id}
            renderItem={({ item }) => (
              <CafeCard cafe={item} active={item.id === active?.id} onPress={() => openCafe(item.id)} colors={colors} />
            )}
              ItemSeparatorComponent={Separator}
              initialNumToRender={cafes.length}
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_INTERVAL}
              decelerationRate="fast"
              onScroll={onScroll}
              scrollEventThrottle={32}
              className="flex-none grow-0 pb-4"
              contentContainerClassName="px-4"
              accessibilityLabel="Kafeler"
              testID="cafe-list"
            />
          ) : (
            <View className="mx-4 mb-4 max-w-[420px] gap-3 rounded-card border border-border bg-surface p-4 dark:border-night-border dark:bg-night-surface">
              <Text className="font-sans text-sm text-ink dark:text-night-ink">“{query.trim()}” için kafe bulunamadı.</Text>
              <Pressable
                onPress={() => onSearch("")}
                accessibilityRole="button"
                className="h-11 items-center justify-center self-start rounded border border-border px-4 dark:border-night-border"
              >
                <Text className="font-medium text-sm text-ink dark:text-night-ink">Aramayı temizle</Text>
              </Pressable>
            </View>
          )}
      </SafeAreaView>

      <CafeSheet cafe={detailOpen ? active : null} onClose={closeSheet} colors={colors} />
    </View>
  );
}

function Separator() {
  return <View className="w-3" />;
}

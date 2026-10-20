import { StatusBar } from "expo-status-bar";
import { Coffee } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CafeMap } from "../src/components/CafeMap";
import { cafes, cameraFor } from "../src/lib/cafes";

const initialCamera = cameraFor(cafes);

export default function MapScreen() {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === "dark";

  return (
    <View className="flex-1 bg-bg dark:bg-night-bg">
      <StatusBar style={dark ? "light" : "dark"} />
      <View className="flex-1" testID="map">
        <CafeMap cafes={cafes} initialCamera={initialCamera} dark={dark} />
      </View>

      <SafeAreaView edges={["top"]} pointerEvents="box-none" className="absolute left-0 right-0 top-0">
        <View className="mx-4 mt-2 flex-row items-center gap-3 self-start rounded-card border border-border bg-surface px-4 py-3 dark:border-night-border dark:bg-night-surface">
          <View className="h-9 w-9 items-center justify-center rounded bg-accent-soft dark:bg-night-accent-soft">
            <Coffee size={20} color={dark ? "#C99A6E" : "#7A5230"} />
          </View>
          <View>
            <Text role="heading" className="font-semibold text-base text-ink dark:text-night-ink">
              CafeMap
            </Text>
            <Text className="font-sans text-xs text-muted dark:text-night-muted">İstanbul · {cafes.length} kafe</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

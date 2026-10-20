import "../global.css";
import "../src/lib/interop";

import { IBMPlexMono_400Regular } from "@expo-google-fonts/ibm-plex-mono";
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
} from "@expo-google-fonts/ibm-plex-sans";
import { useFonts } from "expo-font";
import { colorScheme } from "nativewind";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexMono_400Regular,
  });

  const ready = fontsLoaded || fontError !== null;
  const system = useColorScheme();

  // Follow the device theme. Tailwind uses darkMode: "class", and on web "system"
  // would only clear the class, so pass the resolved scheme instead.
  useEffect(() => {
    colorScheme.set(system === "dark" ? "dark" : "light");
  }, [system]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <Slot />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

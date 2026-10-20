import { cssInterop } from "nativewind";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

// Lets these containers take a className like any core component.
cssInterop(SafeAreaView, { className: "style" });
cssInterop(GestureHandlerRootView, { className: "style" });

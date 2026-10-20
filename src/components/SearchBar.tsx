import { Search, X } from "lucide-react-native";
import { Pressable, TextInput, View } from "react-native";

import type { Palette } from "../lib/theme";

type Props = {
  value: string;
  onChange: (value: string) => void;
  colors: Palette;
};

export function SearchBar({ value, onChange, colors }: Props) {
  return (
    <View className="h-11 flex-row items-center gap-2 rounded border border-border bg-bg px-3 dark:border-night-border dark:bg-night-bg">
      <Search size={18} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Kafe, semt veya özellik ara"
        placeholderTextColor={colors.muted}
        accessibilityLabel="Kafe ara"
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        className="h-full flex-1 font-sans text-base text-ink outline-none dark:text-night-ink"
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChange("")}
          accessibilityRole="button"
          accessibilityLabel="Aramayı temizle"
          hitSlop={8}
          className="h-7 w-7 items-center justify-center rounded"
        >
          <X size={16} color={colors.muted} />
        </Pressable>
      )}
    </View>
  );
}

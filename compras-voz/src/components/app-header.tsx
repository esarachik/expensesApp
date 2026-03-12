import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SettingsDrawer } from "./settings-drawer";

interface Props {
  title: string;
}

export function AppHeader({ title }: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 10,
            backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff",
            borderBottomColor: colorScheme === "dark" ? "#2a2a2a" : "#e8e8e8",
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Pressable
          style={({ pressed }) => [
            styles.hamburger,
            pressed && { opacity: 0.5 },
          ]}
          onPress={() => setDrawerOpen(true)}
          hitSlop={12}
        >
          <View style={[styles.bar, { backgroundColor: colors.text }]} />
          <View
            style={[styles.bar, { backgroundColor: colors.text, width: 18 }]}
          />
          <View style={[styles.bar, { backgroundColor: colors.text }]} />
        </Pressable>
      </View>

      <SettingsDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  hamburger: {
    gap: 5,
    padding: 4,
    alignItems: "flex-end",
  },
  bar: {
    height: 2,
    width: 24,
    borderRadius: 2,
  },
});

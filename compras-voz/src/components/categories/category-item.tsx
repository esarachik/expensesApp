import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Category } from "@/types/category";

type Props = {
  cat: Category;
  onDelete: (cat: Category) => void;
};

export default function CategoryItem({ cat, onDelete }: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <View>
      <Pressable
        style={[
          styles.item,
          { backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#fff" },
        ]}
        onLongPress={() => onDelete(cat)}
      >
        <Text style={[styles.itemText, { color: colors.text }]}>
          {cat.name}
        </Text>
        <Pressable
          onPress={() => onDelete(cat)}
          hitSlop={10}
          style={styles.deleteBtn}
        >
          <Text style={{ color: "#F44336", fontSize: 18, fontWeight: "700" }}>
            ×
          </Text>
        </Pressable>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
  },
  itemText: {
    flex: 1,
    fontSize: 15,
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 8,
  },
});

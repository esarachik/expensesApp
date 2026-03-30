import { Pressable, StyleSheet, Text, View } from "react-native";

import CategoryItem from "@/components/categories/category-item";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Category } from "@/types/category";
import type { TransactionType } from "@/types/transaction";

type Props = {
  title: string;
  color: string;
  type: TransactionType;
  items: Category[];
  onDelete: (cat: Category) => void;
  onAddNew: (type: TransactionType) => void;
};

export default function CategorySection({
  title,
  color,
  type,
  items,
  onDelete,
  onAddNew,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <View>
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.count, { color: colors.icon }]}>
          {items.length}
        </Text>
        <Pressable
          style={[styles.addBtn, { borderColor: color }]}
          onPress={() => onAddNew(type)}
        >
          <Text style={[styles.addBtnText, { color }]}>+ Nueva</Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#fff" },
        ]}
      >
        {items.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.icon }]}>
            Sin categorías
          </Text>
        ) : (
          items.map((cat, idx) => (
            <View key={cat.id}>
              <CategoryItem cat={cat} onDelete={onDelete} />
              {idx < items.length - 1 && (
                <View
                  style={[
                    styles.separator,
                    {
                      backgroundColor: colorScheme === "dark" ? "#333" : "#eee",
                    },
                  ]}
                />
              )}
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingTop: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  count: {
    fontSize: 12,
    fontWeight: "500",
  },
  addBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  card: {
    borderRadius: 10,
    overflow: "hidden",
  },
  emptyText: {
    padding: 16,
    fontSize: 14,
    textAlign: "center",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
});

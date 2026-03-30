import { StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type Props = {
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
};

export default function MonthlySummaryCard({
  totalIngresos,
  totalEgresos,
  balance,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#f5f5f5" },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Resumen del mes
      </Text>
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={[styles.label, { color: colors.icon }]}>Ingresos</Text>
          <Text style={[styles.value, { color: "#4CAF50" }]}>
            ${totalIngresos.toLocaleString()}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={[styles.label, { color: colors.icon }]}>Egresos</Text>
          <Text style={[styles.value, { color: "#F44336" }]}>
            ${totalEgresos.toLocaleString()}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={[styles.label, { color: colors.icon }]}>Balance</Text>
          <Text
            style={[
              styles.value,
              { color: balance >= 0 ? "#4CAF50" : "#F44336" },
            ]}
          >
            ${balance.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  item: {
    alignItems: "center",
    flex: 1,
  },
  label: {
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
  },
});

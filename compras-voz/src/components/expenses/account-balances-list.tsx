import { StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Account } from "@/types/account";

type Props = {
  accounts: Array<Account & { currentBalance: number }>;
};

export default function AccountBalancesList({ accounts }: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  if (accounts.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#f5f5f5" }]}>
      <Text style={[styles.title, { color: colors.text }]}>Cuentas del mes</Text>
      {accounts.map((acc) => (
        <View key={acc.id} style={styles.row}>
          <Text style={styles.icon}>{acc.type === "bank" ? "🏦" : "💳"}</Text>
          <Text style={[styles.name, { color: colors.text }]}>
            {acc.name} {acc.currency}
          </Text>
          <Text
            style={[
              styles.balance,
              {
                color: acc.type === "bank" ? (acc.currentBalance >= 0 ? "#4CAF50" : "#F44336") : "#F44336",
              },
            ]}
          >
            {acc.type === "bank" ? "" : "Gastado: "}${acc.currentBalance.toLocaleString()}
          </Text>
        </View>
      ))}
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
    alignItems: "center",
    paddingVertical: 6,
    gap: 8,
  },
  icon: { fontSize: 18 },
  name: { flex: 1, fontSize: 14, fontWeight: "500" },
  balance: { fontSize: 15, fontWeight: "700" },
});

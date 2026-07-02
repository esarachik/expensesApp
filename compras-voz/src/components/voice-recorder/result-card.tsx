import type { Transaction } from "@/types/transaction";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  transaction: Transaction;
};

export function ResultCard({ transaction }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.resultRow}>
        <MaterialIcons name="check-circle" size={14} color="#4CAF50" />
        <Text style={styles.cardLabel}>Guardado</Text>
      </View>
      <View style={styles.resultRow}>
        <MaterialIcons
          name={transaction.type === "ingreso" ? "trending-up" : "trending-down"}
          size={18}
          color={transaction.type === "ingreso" ? "#4CAF50" : "#F44336"}
        />
        <Text style={[styles.badge, transaction.type === "ingreso" ? styles.badgeIngreso : styles.badgeEgreso]}>
          {transaction.type.toUpperCase()}
        </Text>
      </View>
      <View style={styles.resultRow}>
        <MaterialIcons name="calendar-today" size={14} color="#999" />
        <Text style={styles.resultLine}>{transaction.date}</Text>
      </View>
      <View style={styles.resultRow}>
        <MaterialIcons name="attach-money" size={14} color="#999" />
        <Text style={styles.resultLine}>${transaction.amount.toLocaleString()}</Text>
      </View>
      <View style={styles.resultRow}>
        <MaterialIcons name="label" size={14} color="#999" />
        <Text style={styles.resultLine}>{transaction.category}</Text>
      </View>
      <View style={styles.resultRow}>
        <MaterialIcons name="notes" size={14} color="#999" />
        <Text style={styles.resultLine}>{transaction.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    gap: 6,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  resultLine: {
    fontSize: 15,
    color: "#333",
  },
  badge: {
    fontWeight: "700",
    fontSize: 14,
  },
  badgeIngreso: {
    color: "#4CAF50",
  },
  badgeEgreso: {
    color: "#F44336",
  },
});

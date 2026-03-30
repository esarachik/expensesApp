import type { Transaction } from "@/types/transaction";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  transaction: Transaction;
};

export function ResultCard({ transaction }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>✅ Guardado</Text>
      <Text style={styles.resultLine}>
        {transaction.type === "ingreso" ? "💰" : "💸"}{" "}
        <Text
          style={[
            styles.badge,
            transaction.type === "ingreso"
              ? styles.badgeIngreso
              : styles.badgeEgreso,
          ]}
        >
          {transaction.type.toUpperCase()}
        </Text>
      </Text>
      <Text style={styles.resultLine}>📅 {transaction.date}</Text>
      <Text style={styles.resultLine}>
        💲 ${transaction.amount.toLocaleString()}
      </Text>
      <Text style={styles.resultLine}>📁 {transaction.category}</Text>
      <Text style={styles.resultLine}>📝 {transaction.description}</Text>
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
  resultLine: {
    fontSize: 16,
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

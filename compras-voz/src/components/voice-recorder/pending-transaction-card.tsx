import { getCategoriesByType } from "@/constants/categories";
import type { Account } from "@/types/account";
import type { Transaction } from "@/types/transaction";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  transaction: Transaction;
  transcription: string | null;
  selectedDate: Date;
  showDatePicker: boolean;
  saving: boolean;
  availableAccounts: Account[];
  onDateChange: (event: DateTimePickerEvent, date?: Date) => void;
  onShowDatePicker: () => void;
  onSelectAccount: (id: number | null | undefined) => void;
  onSelectCategory: (category: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export function PendingTransactionCard({
  transaction,
  transcription,
  selectedDate,
  showDatePicker,
  saving,
  availableAccounts,
  onDateChange,
  onShowDatePicker,
  onSelectAccount,
  onSelectCategory,
  onConfirm,
  onCancel,
}: Props) {
  const categories = getCategoriesByType(transaction.type);
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Confirmar transacción</Text>

      {transcription && (
        <Text style={[styles.cardText, { marginBottom: 8 }]}>
          "{transcription}"
        </Text>
      )}

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
      <Text style={styles.resultLine}>
        💲 ${transaction.amount.toLocaleString()}
      </Text>
      <View style={styles.categorySection}>
        <Text style={styles.categoryLabel}>📁 Categoría</Text>
        <View style={styles.categoryChips}>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              style={[
                styles.categoryChip,
                transaction.category === cat && styles.categoryChipActive,
              ]}
              onPress={() => onSelectCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  transaction.category === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Text style={styles.resultLine}>📝 {transaction.description}</Text>

      <Pressable style={styles.dateButton} onPress={onShowDatePicker}>
        <Text style={styles.dateButtonText}>📅 {transaction.date}</Text>
        <Text style={styles.dateButtonHint}>Toca para cambiar</Text>
      </Pressable>

      {availableAccounts.length > 0 && (
        <View style={styles.accountSection}>
          <Text style={styles.accountLabel}>Cuenta</Text>
          <View style={styles.accountChips}>
            <Pressable
              style={[
                styles.accountChip,
                !transaction.accountId && styles.accountChipActive,
              ]}
              onPress={() => onSelectAccount(null)}
            >
              <Text
                style={[
                  styles.accountChipText,
                  !transaction.accountId && styles.accountChipTextActive,
                ]}
              >
                Sin cuenta
              </Text>
            </Pressable>
            {availableAccounts.map((acc) => (
              <Pressable
                key={acc.id}
                style={[
                  styles.accountChip,
                  transaction.accountId === acc.id && styles.accountChipActive,
                ]}
                onPress={() => onSelectAccount(acc.id)}
              >
                <Text
                  style={[
                    styles.accountChipText,
                    transaction.accountId === acc.id &&
                      styles.accountChipTextActive,
                  ]}
                >
                  {acc.type === "bank" ? "🏦" : "💳"} {acc.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <View style={styles.confirmRow}>
        <Pressable
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>❌ Cancelar</Text>
        </Pressable>
        <Pressable
          style={styles.confirmButton}
          onPress={onConfirm}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.confirmButtonText}>✅ Guardar</Text>
          )}
        </Pressable>
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
  cardText: {
    fontSize: 15,
    color: "#333",
    fontStyle: "italic",
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
  dateButton: {
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1976D2",
  },
  dateButtonHint: {
    fontSize: 11,
    color: "#90A4AE",
    marginTop: 2,
  },
  accountSection: {
    marginTop: 8,
  },
  accountLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  accountChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  accountChip: {
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  accountChipActive: {
    borderColor: "#2196F3",
    backgroundColor: "#e3f2fd",
  },
  accountChipText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  accountChipTextActive: {
    color: "#1976D2",
    fontWeight: "700",
  },
  categorySection: {
    marginTop: 4,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  categoryChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  categoryChipActive: {
    borderColor: "#FF9800",
    backgroundColor: "#FFF3E0",
  },
  categoryChipText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  categoryChipTextActive: {
    color: "#E65100",
    fontWeight: "700",
  },
  confirmRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
});

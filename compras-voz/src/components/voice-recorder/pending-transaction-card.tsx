import { getCategoriesByType } from "@/constants/categories";
import type { Account } from "@/types/account";
import type { Transaction, TransactionType } from "@/types/transaction";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
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
  onSelectType: (type: TransactionType) => void;
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
  onSelectType,
  onConfirm,
  onCancel,
}: Props) {
  const categories = getCategoriesByType(transaction.type);
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Confirmar transacción</Text>

      {transcription && <Text style={styles.cardText}>"{transcription}"</Text>}

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Monto</Text>
        <Text style={styles.infoValue}>
          ${transaction.amount.toLocaleString()}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Descripción</Text>
        <Text style={styles.infoValue} numberOfLines={2}>
          {transaction.description}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.typeRow}>
        <Pressable
          style={[
            styles.typeChip,
            transaction.type === "ingreso" && styles.typeChipIngresoActive,
          ]}
          onPress={() => onSelectType("ingreso")}
        >
          <Text
            style={[
              styles.typeChipText,
              transaction.type === "ingreso" &&
                styles.typeChipIngresoTextActive,
            ]}
          >
            💰 Ingreso
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.typeChip,
            transaction.type === "egreso" && styles.typeChipEgresoActive,
          ]}
          onPress={() => onSelectType("egreso")}
        >
          <Text
            style={[
              styles.typeChipText,
              transaction.type === "egreso" && styles.typeChipEgresoTextActive,
            ]}
          >
            💸 Egreso
          </Text>
        </Pressable>
      </View>
      <View style={styles.categorySection}>
        <Text style={styles.sectionLabel}>📁 Categoría</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={transaction.category}
            onValueChange={(val) => onSelectCategory(val)}
            style={styles.picker}
            dropdownIconColor="#999"
          >
            {categories.map((cat) => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>
      </View>

      <Pressable style={styles.dateButton} onPress={onShowDatePicker}>
        <Text style={styles.sectionLabel}>📅 Fecha</Text>
        <Text style={styles.dateButtonValue}>{transaction.date}</Text>
      </Pressable>

      {availableAccounts.length > 0 && (
        <View style={styles.accountSection}>
          <Text style={styles.sectionLabel}>🏦 Cuenta</Text>
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
    gap: 10,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
  },
  cardText: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
  },
  typeRow: {
    flexDirection: "row",
    gap: 10,
  },
  typeChip: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  typeChipIngresoActive: {
    borderColor: "#4CAF50",
    backgroundColor: "#E8F5E9",
  },
  typeChipEgresoActive: {
    borderColor: "#F44336",
    backgroundColor: "#FFEBEE",
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#bbb",
  },
  typeChipIngresoTextActive: {
    color: "#2E7D32",
  },
  typeChipEgresoTextActive: {
    color: "#C62828",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#aaa",
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
    flexShrink: 1,
    textAlign: "right",
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#aaa",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  categorySection: {},
  pickerWrapper: {
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  picker: {
    width: "100%",
  },
  dateButton: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateButtonValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1976D2",
  },
  accountSection: {},
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
  confirmRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
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

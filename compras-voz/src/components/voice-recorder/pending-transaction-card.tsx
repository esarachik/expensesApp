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
  TextInput,
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
  onChangeAmount: (amount: number) => void;
  onChangeDescription: (description: string) => void;
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
  onChangeAmount,
  onChangeDescription,
  onConfirm,
  onCancel,
}: Props) {
  const categories = getCategoriesByType(transaction.type);
  return (
    <>
      <Text style={styles.cardLabel}>Confirmar transacción</Text>
      <View style={styles.card}>
        {transcription && (
          <Text style={styles.cardText}>"{transcription}"</Text>
        )}

        <View style={styles.infoRow}>
          <View style={styles.field}>
            <Text style={styles.sectionLabel}>💲 Monto</Text>
            <TextInput
              style={styles.fieldInput}
              value={String(transaction.amount)}
              onChangeText={(t) => {
                const n = parseFloat(t.replace(",", "."));
                if (!isNaN(n)) onChangeAmount(n);
              }}
              keyboardType="numeric"
              selectTextOnFocus
            />
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.field}>
            <Text style={styles.sectionLabel}>📝 Descripción</Text>
            <TextInput
              style={styles.fieldInput}
              value={transaction.description}
              onChangeText={onChangeDescription}
            />
          </View>
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
                transaction.type === "egreso" &&
                  styles.typeChipEgresoTextActive,
              ]}
            >
              💸 Egreso
            </Text>
          </Pressable>
        </View>
        <View style={styles.categorySection}>
          <Text style={styles.sectionLabel}>📁 Categoría</Text>
          <View style={styles.field}>
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

        <Pressable style={styles.field} onPress={onShowDatePicker}>
          <Text style={styles.sectionLabel}>📅 Fecha</Text>
          <Text style={styles.fieldValue}>{transaction.date}</Text>
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
                    transaction.accountId === acc.id &&
                      styles.accountChipActive,
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
    </>
  );
}

const styles = StyleSheet.create({
  cardLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  cardText: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    gap: 10,
  },
  field: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    overflow: "hidden",
  },
  fieldInput: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
    paddingVertical: 2,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1976D2",
    paddingVertical: 2,
  },
  sectionLabel: {
    fontSize: 11,
    color: "#999",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 2,
  },
  typeRow: {
    flexDirection: "row",
    gap: 8,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  typeChipIngresoActive: {
    backgroundColor: "#e8f5e9",
    borderColor: "#43a047",
  },
  typeChipEgresoActive: {
    backgroundColor: "#fce4ec",
    borderColor: "#e53935",
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
  },
  typeChipIngresoTextActive: {
    color: "#2e7d32",
  },
  typeChipEgresoTextActive: {
    color: "#c62828",
  },
  categorySection: {
    gap: 4,
  },
  picker: {
    width: "100%",
    marginTop: -8,
    marginBottom: -8,
    marginHorizontal: -12,
  },
  accountSection: {
    gap: 6,
  },
  accountChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  accountChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  accountChipActive: {
    backgroundColor: "#e3f2fd",
    borderColor: "#1976D2",
  },
  accountChipText: {
    fontSize: 13,
    color: "#666",
  },
  accountChipTextActive: {
    color: "#1976D2",
    fontWeight: "600",
  },
  confirmRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#1976D2",
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AccountBalancesList from "@/components/expenses/account-balances-list";
import MonthlySummaryCard from "@/components/expenses/monthly-summary-card";
import TransactionTable from "@/components/expenses/transaction-table";
import { AppHeader } from "@/components/layout/app-header";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getAccountsWithBalance } from "@/services/account";
import { getCategoriesByType } from "@/services/category";
import { deleteTransaction, getAvailableMonths, getMonthlySummary, getTransactionsByMonth, updateTransaction } from "@/services/transaction";
import type { Account } from "@/types/account";
import type { Transaction, TransactionType } from "@/types/transaction";

const formatDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const parseDate = (value: string) => {
  const [yyyy, mm, dd] = value.split("-").map(Number);
  if (!yyyy || !mm || !dd) {
    return new Date();
  }
  const parsed = new Date(yyyy, mm - 1, dd);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

export default function ResumenScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({
    totalIngresos: 0,
    totalEgresos: 0,
    balance: 0,
  });
  const [accountBalances, setAccountBalances] = useState<Array<Account & { currentBalance: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [categoryNames, setCategoryNames] = useState<string[]>([]);
  const [form, setForm] = useState<Omit<Transaction, "id"> & { id?: number }>({
    date: "",
    amount: 0,
    type: "egreso",
    category: "",
    description: "",
    originalText: "",
    accountId: null,
  });

  useEffect(() => {
    let active = true;

    getCategoriesByType(form.type)
      .then((cats) => {
        if (!active) {
          return;
        }
        const names = cats.map((c) => c.name);
        setCategoryNames(names);
        setForm((current) => {
          if (!names.length) {
            return current.category ? { ...current, category: "" } : current;
          }
          if (current.category && names.includes(current.category)) {
            return current;
          }
          return { ...current, category: names[0] };
        });
      })
      .catch(() => {
        if (active) {
          setCategoryNames([]);
        }
      });

    return () => {
      active = false;
    };
  }, [form.type]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [txs, sum, accs, months] = await Promise.all([
        getTransactionsByMonth(selectedMonth),
        getMonthlySummary(selectedMonth),
        getAccountsWithBalance(selectedMonth),
        getAvailableMonths(),
      ]);
      setTransactions(txs);
      setSummary(sum);
      setAccountBalances(accs);
      setAvailableMonths(months);
    } catch (e: any) {
      console.error("Error cargando datos:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleDelete = (id: number) => {
    Alert.alert("Eliminar", "¿Seguro que querés eliminar esta transacción?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteTransaction(id);
          loadData();
        },
      },
    ]);
  };

  const openEdit = (tx: Transaction) => {
    setForm({
      id: tx.id,
      date: tx.date,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      description: tx.description,
      originalText: tx.originalText,
      accountId: tx.accountId ?? null,
    });
    setSelectedDate(parseDate(tx.date));
    setShowDatePicker(false);
    setModalVisible(true);
  };

  const onDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (!date) {
      return;
    }
    setSelectedDate(date);
    setForm((f) => ({ ...f, date: formatDate(date) }));
  };

  const onSave = async () => {
    if (!form.id) {
      Alert.alert("Error", "No se pudo identificar la transacción");
      return;
    }
    if (!form.date.trim()) {
      Alert.alert("Error", "Ingresá una fecha");
      return;
    }
    if (!form.category.trim()) {
      Alert.alert("Error", "Ingresá una categoría");
      return;
    }
    if (!form.amount || form.amount <= 0) {
      Alert.alert("Error", "Ingresá un monto mayor a 0");
      return;
    }

    setSaving(true);
    try {
      await updateTransaction(form as Transaction);
      setModalVisible(false);
      await loadData();
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo guardar la transacción");
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <Pressable
      style={[styles.row, { backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#fff" }]}
      onPress={() => openEdit(item)}
      onLongPress={() => item.id && handleDelete(item.id)}
    >
      <View style={styles.rowLeft}>
        <MaterialIcons
          name={item.type === "ingreso" ? "trending-up" : "trending-down"}
          size={26}
          color={item.type === "ingreso" ? "#4CAF50" : "#F44336"}
          style={styles.rowIcon}
        />
        <View style={styles.rowInfo}>
          <Text style={[styles.rowDesc, { color: colors.text }]} numberOfLines={1}>
            {item.description || item.category}
          </Text>
          <Text style={[styles.rowMeta, { color: colors.icon }]}>
            {item.date} · {item.category}
          </Text>
        </View>
      </View>
      <Text style={[styles.rowAmount, { color: item.type === "ingreso" ? "#4CAF50" : "#F44336" }]}>
        {item.type === "ingreso" ? "+" : "-"}${item.amount.toLocaleString()}
      </Text>
    </Pressable>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["left", "right", "bottom"]}>
        <AppHeader title="Resumen" />
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["left", "right", "bottom"]}>
      <AppHeader title="Resumen" />

      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <MonthlySummaryCard
          totalIngresos={summary.totalIngresos}
          totalEgresos={summary.totalEgresos}
          balance={summary.balance}
          yearMonth={selectedMonth}
          availableMonths={availableMonths}
          onMonthChange={setSelectedMonth}
        />

        <AccountBalancesList accounts={accountBalances} />

        <TransactionTable transactions={transactions} renderItem={renderItem} />

        <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
          <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View
              style={[
                styles.modalSheet,
                {
                  backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#fff",
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>Editar transacción</Text>

              <Text style={[styles.fieldLabel, { color: colors.icon }]}>Tipo</Text>
              <View style={styles.typeRow}>
                {(["ingreso", "egreso"] as TransactionType[]).map((t) => (
                  <Pressable
                    key={t}
                    style={[
                      styles.typeButton,
                      form.type === t && styles.typeButtonActive,
                      {
                        borderColor: form.type === t ? "#2196F3" : colorScheme === "dark" ? "#444" : "#ddd",
                      },
                    ]}
                    onPress={() => setForm((f) => ({ ...f, type: t }))}
                  >
                    <Text style={[styles.typeButtonText, form.type === t && { color: "#2196F3" }]}>{t === "ingreso" ? "Ingreso" : "Egreso"}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.fieldLabel, { color: colors.icon }]}>Fecha</Text>
              <Pressable
                style={[
                  styles.input,
                  {
                    borderColor: colorScheme === "dark" ? "#444" : "#ddd",
                  },
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.inputText, { color: form.date ? colors.text : colors.icon }]}>{form.date || "Seleccioná una fecha"}</Text>
              </Pressable>
              {showDatePicker && <DateTimePicker value={selectedDate} mode="date" display="default" onChange={onDateChange} />}

              <Text style={[styles.fieldLabel, { color: colors.icon }]}>Monto</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    borderColor: colorScheme === "dark" ? "#444" : "#ddd",
                  },
                ]}
                placeholder="0"
                placeholderTextColor={colors.icon}
                keyboardType="numeric"
                value={form.amount === 0 ? "" : String(form.amount)}
                onChangeText={(v) => setForm((f) => ({ ...f, amount: Number(v) || 0 }))}
              />

              <Text style={[styles.fieldLabel, { color: colors.icon }]}>Categoría</Text>
              <View
                style={[
                  styles.pickerContainer,
                  {
                    borderColor: colorScheme === "dark" ? "#444" : "#ddd",
                  },
                ]}
              >
                <Picker
                  selectedValue={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: String(v) }))}
                  style={styles.picker}
                  dropdownIconColor={colors.icon}
                >
                  {!categoryNames.length && <Picker.Item label="Sin categorías" value="" enabled={false} />}
                  {categoryNames.map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))}
                </Picker>
              </View>

              <Text style={[styles.fieldLabel, { color: colors.icon }]}>Descripción</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    borderColor: colorScheme === "dark" ? "#444" : "#ddd",
                  },
                ]}
                placeholder="Descripción"
                placeholderTextColor={colors.icon}
                value={form.description}
                onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
              />

              <View style={styles.modalButtons}>
                <Pressable style={styles.cancelBtn} onPress={() => setModalVisible(false)} disabled={saving}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </Pressable>
                <Pressable style={styles.saveBtn} onPress={onSave} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Guardar</Text>}
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tableHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  rowIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  rowInfo: {
    flex: 1,
  },
  rowDesc: {
    fontSize: 15,
    fontWeight: "500",
  },
  rowMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  rowAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    gap: 4,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  inputText: {
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    marginVertical: -8,
  },
  typeRow: { flexDirection: "row", gap: 10 },
  typeButton: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  typeButtonActive: { backgroundColor: "#e3f2fd" },
  typeButtonText: { fontSize: 14, fontWeight: "500", color: "#666" },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelBtnText: { color: "#666", fontSize: 15, fontWeight: "600" },
  saveBtn: {
    flex: 1,
    backgroundColor: "#2196F3",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});

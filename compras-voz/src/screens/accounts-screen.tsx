import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "@/components/app-header";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
    deleteAccount,
    getAccountsWithBalance,
    upsertAccount,
} from "@/services/account";
import type { Account, AccountType } from "@/types/account";
import { ACCOUNT_TYPE_LABELS } from "@/types/account";

const currentYearMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

type AccountWithBalance = Account & { currentBalance: number };

const EMPTY_FORM: Omit<Account, "id"> = {
  name: "",
  type: "bank",
  initialBalance: 0,
  month: currentYearMonth(),
};

export default function AccountsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Omit<Account, "id"> & { id?: number }>(
    EMPTY_FORM,
  );

  const yearMonth = currentYearMonth();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAccountsWithBalance(yearMonth);
      setAccounts(data);
    } catch (e: any) {
      console.error("Error cargando cuentas:", e);
    } finally {
      setLoading(false);
    }
  }, [yearMonth]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const openNew = () => {
    setForm({ ...EMPTY_FORM, month: yearMonth });
    setModalVisible(true);
  };

  const openEdit = (acc: AccountWithBalance) => {
    setForm({
      id: acc.id,
      name: acc.name,
      type: acc.type,
      initialBalance: acc.initialBalance,
      month: acc.month,
    });
    setModalVisible(true);
  };

  const onSave = async () => {
    if (!form.name.trim()) {
      Alert.alert("Error", "Ingresá un nombre para la cuenta");
      return;
    }
    setSaving(true);
    try {
      await upsertAccount(form as Account);
      setModalVisible(false);
      await loadData();
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo guardar la cuenta");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = (acc: AccountWithBalance) => {
    Alert.alert("Eliminar", `¿Eliminar "${acc.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteAccount(acc.id!);
          await loadData();
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: AccountWithBalance }) => {
    const isBank = item.type === "bank";
    return (
      <Pressable
        style={[
          styles.card,
          { backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#fff" },
        ]}
        onPress={() => openEdit(item)}
        onLongPress={() => onDelete(item)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>{isBank ? "🏦" : "💳"}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardName, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.cardType, { color: colors.icon }]}>
              {ACCOUNT_TYPE_LABELS[item.type]}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.cardLabel, { color: colors.icon }]}>
              {isBank ? "Saldo actual" : "Gastado este mes"}
            </Text>
            <Text
              style={[
                styles.cardBalance,
                {
                  color: isBank
                    ? item.currentBalance >= 0
                      ? "#4CAF50"
                      : "#F44336"
                    : "#F44336",
                },
              ]}
            >
              ${item.currentBalance.toLocaleString()}
            </Text>
          </View>
        </View>
        {isBank && (
          <Text style={[styles.cardInitial, { color: colors.icon }]}>
            Saldo inicial: ${item.initialBalance.toLocaleString()}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["left", "right", "bottom"]}
    >
      <AppHeader title="Cuentas" />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Subheader: month + add button */}
        <View style={styles.header}>
          <Text style={[styles.headerSub, { color: colors.icon }]}>
            {yearMonth}
          </Text>
          <Pressable style={styles.addButton} onPress={openNew}>
            <Text style={styles.addButtonText}>+ Nueva</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.tint}
            style={{ marginTop: 40 }}
          />
        ) : accounts.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ color: colors.icon, fontSize: 16 }}>
              Sin cuentas para este mes
            </Text>
            <Text style={{ color: colors.icon, fontSize: 13, marginTop: 4 }}>
              Tocá "+ Nueva" para agregar una cuenta o tarjeta
            </Text>
          </View>
        ) : (
          <FlatList
            data={accounts}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
          />
        )}

        {/* Modal alta/edición */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View
              style={[
                styles.modalSheet,
                {
                  backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#fff",
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {form.id ? "Editar cuenta" : "Nueva cuenta"}
              </Text>

              <Text style={[styles.fieldLabel, { color: colors.icon }]}>
                Nombre
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    borderColor: colorScheme === "dark" ? "#444" : "#ddd",
                  },
                ]}
                placeholder="Ej: Banco Nación, Visa..."
                placeholderTextColor={colors.icon}
                value={form.name}
                onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              />

              <Text style={[styles.fieldLabel, { color: colors.icon }]}>
                Tipo
              </Text>
              <View style={styles.typeRow}>
                {(["bank", "credit_card"] as AccountType[]).map((t) => (
                  <Pressable
                    key={t}
                    style={[
                      styles.typeButton,
                      form.type === t && styles.typeButtonActive,
                      {
                        borderColor:
                          form.type === t
                            ? "#2196F3"
                            : colorScheme === "dark"
                              ? "#444"
                              : "#ddd",
                      },
                    ]}
                    onPress={() => setForm((f) => ({ ...f, type: t }))}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        form.type === t && { color: "#2196F3" },
                      ]}
                    >
                      {ACCOUNT_TYPE_LABELS[t]}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.fieldLabel, { color: colors.icon }]}>
                {form.type === "bank"
                  ? "Saldo inicial del mes"
                  : "Deuda inicial del mes"}
              </Text>
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
                value={
                  form.initialBalance === 0 ? "" : String(form.initialBalance)
                }
                onChangeText={(v) =>
                  setForm((f) => ({ ...f, initialBalance: Number(v) || 0 }))
                }
              />

              <View style={styles.modalButtons}>
                <Pressable
                  style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}
                  disabled={saving}
                >
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={styles.saveBtn}
                  onPress={onSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.saveBtnText}>Guardar</Text>
                  )}
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
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 24, fontWeight: "700" },
  headerSub: { fontSize: 13, marginTop: 2 },
  addButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 4 },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardIcon: { fontSize: 28 },
  cardName: { fontSize: 16, fontWeight: "600" },
  cardType: { fontSize: 12, marginTop: 2 },
  cardLabel: { fontSize: 11, textTransform: "uppercase" },
  cardBalance: { fontSize: 20, fontWeight: "700", marginTop: 2 },
  cardInitial: { fontSize: 12, marginTop: 8 },
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

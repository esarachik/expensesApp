import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  deleteTransaction,
  getAllTransactions,
  getAccountsWithBalance,
  getMonthlySummary
} from "@/services/database";
import type { Account } from "@/types/account";
import type { Transaction } from "@/types/transaction";

export default function ResumenScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({
    totalIngresos: 0,
    totalEgresos: 0,
    balance: 0,
  });
  const [accountBalances, setAccountBalances] = useState<
    Array<Account & { currentBalance: number }>
  >([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const [txs, sum, accs] = await Promise.all([
        getAllTransactions(),
        getMonthlySummary(yearMonth),
        getAccountsWithBalance(yearMonth),
      ]);
      setTransactions(txs);
      setSummary(sum);
      setAccountBalances(accs);
    } catch (e: any) {
      console.error("Error cargando datos:", e);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const renderItem = ({ item }: { item: Transaction }) => (
    <Pressable
      style={[
        styles.row,
        { backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#fff" },
      ]}
      onPress={() =>
        router.push({
          pathname: "/modal",
          params: {
            id: String(item.id),
            date: item.date,
            amount: String(item.amount),
            type: item.type,
            category: item.category,
            description: item.description,
            originalText: item.originalText,
          },
        })
      }
      onLongPress={() => item.id && handleDelete(item.id)}
    >
      <View style={styles.rowLeft}>
        <Text style={styles.rowIcon}>
          {item.type === "ingreso" ? "💰" : "💸"}
        </Text>
        <View style={styles.rowInfo}>
          <Text
            style={[styles.rowDesc, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.description || item.category}
          </Text>
          <Text style={[styles.rowMeta, { color: colors.icon }]}>
            {item.date} · {item.category}
          </Text>
        </View>
      </View>
      <Text
        style={[
          styles.rowAmount,
          { color: item.type === "ingreso" ? "#4CAF50" : "#F44336" },
        ]}
      >
        {item.type === "ingreso" ? "+" : "-"}${item.amount.toLocaleString()}
      </Text>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.summaryCard,
          { backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#f5f5f5" },
        ]}
      >
        <Text style={[styles.summaryTitle, { color: colors.text }]}>
          Resumen del mes
        </Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.icon }]}>
              Ingresos
            </Text>
            <Text style={[styles.summaryValue, { color: "#4CAF50" }]}>
              ${summary.totalIngresos.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.icon }]}>
              Egresos
            </Text>
            <Text style={[styles.summaryValue, { color: "#F44336" }]}>
              ${summary.totalEgresos.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.icon }]}>
              Balance
            </Text>
            <Text
              style={[
                styles.summaryValue,
                { color: summary.balance >= 0 ? "#4CAF50" : "#F44336" },
              ]}
            >
              ${summary.balance.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {accountBalances.length > 0 && (
        <View style={[styles.summaryCard, { backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#f5f5f5' }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Cuentas del mes</Text>
          {accountBalances.map((acc) => (
            <View key={acc.id} style={styles.accountRow}>
              <Text style={styles.accountRowIcon}>{acc.type === 'bank' ? '🏦' : '💳'}</Text>
              <Text style={[styles.accountRowName, { color: colors.text }]}>{acc.name}</Text>
              <Text
                style={[
                  styles.accountRowBalance,
                  {
                    color:
                      acc.type === 'bank'
                        ? acc.currentBalance >= 0 ? '#4CAF50' : '#F44336'
                        : '#F44336',
                  },
                ]}
              >
                {acc.type === 'bank' ? '' : 'Gastado: '}${acc.currentBalance.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Tabla de transacciones */}
      <View
        style={[
          styles.tableHeader,
          { borderBottomColor: colorScheme === "dark" ? "#333" : "#e0e0e0" },
        ]}
      >
        <Text style={[styles.tableHeaderText, { color: colors.icon }]}>
          Todas las transacciones ({transactions.length})
        </Text>
      </View>

      {transactions.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: colors.icon, fontSize: 16 }}>
            No hay transacciones registradas
          </Text>
          <Text style={{ color: colors.icon, fontSize: 13, marginTop: 4 }}>
            Grabá un gasto o ingreso desde Home
          </Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ItemSeparatorComponent={() => (
            <View
              style={{
                height: 1,
                backgroundColor: colorScheme === "dark" ? "#333" : "#eee",
              }}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryCard: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
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
  },  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  accountRowIcon: { fontSize: 18 },
  accountRowName: { flex: 1, fontSize: 14, fontWeight: '500' },
  accountRowBalance: { fontSize: 15, fontWeight: '700' },});

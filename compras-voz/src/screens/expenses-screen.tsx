import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AccountBalancesList from "@/components/expenses/account-balances-list";
import MonthlySummaryCard from "@/components/expenses/monthly-summary-card";
import TransactionTable from "@/components/expenses/transaction-table";
import { AppHeader } from "@/components/layout/app-header";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getAccountsWithBalance } from "@/services/account";
import {
  deleteTransaction,
  getAllTransactions,
  getMonthlySummary,
} from "@/services/transaction";
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
          pathname: "/transaction-detail",
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
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={["left", "right", "bottom"]}
      >
        <AppHeader title="Resumen" />
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["left", "right", "bottom"]}
    >
      <AppHeader title="Resumen" />

      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <MonthlySummaryCard
          totalIngresos={summary.totalIngresos}
          totalEgresos={summary.totalEgresos}
          balance={summary.balance}
        />

        <AccountBalancesList accounts={accountBalances} />

        <TransactionTable transactions={transactions} renderItem={renderItem} />
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
});

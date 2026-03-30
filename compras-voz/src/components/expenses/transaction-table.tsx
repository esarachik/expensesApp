import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

export default function TransactionTable({
  transactions,
  renderItem,
}: {
  transactions: any[];
  renderItem: any;
}) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  return (
    <>
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
    </>
  );
}
const styles = StyleSheet.create({
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
});

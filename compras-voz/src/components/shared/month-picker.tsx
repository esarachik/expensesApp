import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  yearMonth: string;
  availableMonths?: string[];
  onMonthChange?: (month: string) => void;
  maxVisibleMonths?: number;
};

const MONTHS_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function formatYearMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split("-");
  return `${MONTHS_ES[parseInt(month, 10) - 1]} ${year}`;
}

export default function MonthPicker({ yearMonth, availableMonths = [], onMonthChange, maxVisibleMonths }: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const [pickerVisible, setPickerVisible] = useState(false);

  const visibleMonths = useMemo(() => {
    const months = availableMonths.includes(yearMonth) ? availableMonths : [yearMonth, ...availableMonths];
    if (!maxVisibleMonths || maxVisibleMonths <= 0) return months;
    return months.slice(0, maxVisibleMonths);
  }, [availableMonths, maxVisibleMonths, yearMonth]);

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.monthButton, { backgroundColor: colorScheme === "dark" ? "#333" : "#e0e0e0" }, pressed && { opacity: 0.6 }]}
        onPress={() => setPickerVisible(true)}
      >
        <Text style={[styles.monthButtonText, { color: colors.tint }]}>{formatYearMonth(yearMonth)} ▾</Text>
      </Pressable>

      <Modal visible={pickerVisible} transparent animationType="fade" onRequestClose={() => setPickerVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setPickerVisible(false)}>
          <View style={[styles.pickerCard, { backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#fff" }]} onStartShouldSetResponder={() => true}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>Seleccionar mes</Text>
            {visibleMonths.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.icon }]}>Sin datos disponibles</Text>
            ) : (
              <FlatList
                data={visibleMonths}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => [
                      styles.pickerItem,
                      item === yearMonth && {
                        backgroundColor: colorScheme === "dark" ? "#3a3a3a" : "#f0f0f0",
                      },
                      pressed && { opacity: 0.6 },
                    ]}
                    onPress={() => {
                      onMonthChange?.(item);
                      setPickerVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        { color: colors.text },
                        item === yearMonth && {
                          color: colors.tint,
                          fontWeight: "700",
                        },
                      ]}
                    >
                      {formatYearMonth(item)}
                    </Text>
                  </Pressable>
                )}
              />
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  monthButton: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  monthButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerCard: {
    width: 240,
    borderRadius: 14,
    paddingVertical: 8,
    maxHeight: 320,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  pickerTitle: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  pickerItemText: {
    fontSize: 16,
  },
  emptyText: {
    fontSize: 14,
    padding: 16,
    textAlign: "center",
  },
});

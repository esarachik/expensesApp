import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CategorySection from "@/components/categories/category-section";
import NewCategoryModal from "@/components/categories/new-category-modal";
import { AppHeader } from "@/components/layout/app-header";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { deleteCategory, getAllCategories } from "@/services/category";
import type { Category } from "@/types/category";
import type { TransactionType } from "@/types/transaction";

export default function CategoriesScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const [ingresos, setIngresos] = useState<Category[]>([]);
  const [egresos, setEgresos] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>("egreso");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getAllCategories();
      setIngresos(all.filter((c) => c.type === "ingreso"));
      setEgresos(all.filter((c) => c.type === "egreso"));
    } catch (e: any) {
      console.error("Error cargando categorías:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const openNew = (type: TransactionType) => {
    setModalType(type);
    setModalVisible(true);
  };

  const onDelete = (cat: Category) => {
    Alert.alert("Eliminar", `¿Eliminar la categoría "${cat.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteCategory(cat.id!);
          await loadData();
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["left", "right", "bottom"]}
    >
      <AppHeader title="Categorías" />

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.tint}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={[]}
          ListHeaderComponent={
            <View style={styles.listContent}>
              <CategorySection
                title="Ingresos"
                color="#4CAF50"
                type="ingreso"
                items={ingresos}
                onDelete={onDelete}
                onAddNew={openNew}
              />
              <View style={styles.spacer} />
              <CategorySection
                title="Egresos"
                color="#F44336"
                type="egreso"
                items={egresos}
                onDelete={onDelete}
                onAddNew={openNew}
              />
              <Text style={[styles.hint, { color: colors.icon }]}>
                Tocá o mantené presionado para eliminar
              </Text>
            </View>
          }
          renderItem={() => null}
          keyExtractor={() => ""}
        />
      )}

      <NewCategoryModal
        visible={modalVisible}
        initialType={modalType}
        onClose={() => setModalVisible(false)}
        onSaved={loadData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  spacer: {
    height: 16,
  },
  hint: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 20,
  },
});

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
    deleteCategory,
    getAllCategories,
    insertCategory,
} from "@/services/category";
import type { Category } from "@/types/category";
import type { TransactionType } from "@/types/transaction";

export default function CategoriesScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const [ingresos, setIngresos] = useState<Category[]>([]);
  const [egresos, setEgresos] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<TransactionType>("egreso");
  const [saving, setSaving] = useState(false);

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
    setNewName("");
    setNewType(type);
    setModalVisible(true);
  };

  const onSave = async () => {
    const name = newName.trim().toLowerCase();
    if (!name) {
      Alert.alert("Error", "Ingresá un nombre para la categoría");
      return;
    }
    setSaving(true);
    try {
      await insertCategory({ name, type: newType });
      setModalVisible(false);
      await loadData();
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo guardar la categoría");
    } finally {
      setSaving(false);
    }
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

  const renderCategoryItem = (cat: Category) => (
    <View key={cat.id}>
      <Pressable
        style={[
          styles.item,
          { backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#fff" },
        ]}
        onLongPress={() => onDelete(cat)}
      >
        <Text style={[styles.itemText, { color: colors.text }]}>
          {cat.name}
        </Text>
        <Pressable
          onPress={() => onDelete(cat)}
          hitSlop={10}
          style={styles.deleteBtn}
        >
          <Text style={{ color: "#F44336", fontSize: 18, fontWeight: "700" }}>
            ×
          </Text>
        </Pressable>
      </Pressable>
    </View>
  );

  const renderSection = (
    title: string,
    color: string,
    type: TransactionType,
    items: Category[],
  ) => (
    <View key={type}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionDot, { backgroundColor: color }]} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.sectionCount, { color: colors.icon }]}>
          {items.length}
        </Text>
        <Pressable
          style={[styles.addBtn, { borderColor: color }]}
          onPress={() => openNew(type)}
        >
          <Text style={[styles.addBtnText, { color }]}>+ Nueva</Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.sectionCard,
          { backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#fff" },
        ]}
      >
        {items.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.icon }]}>
            Sin categorías
          </Text>
        ) : (
          items.map((cat, idx) => (
            <View key={cat.id}>
              {renderCategoryItem(cat)}
              {idx < items.length - 1 && (
                <View
                  style={{
                    height: StyleSheet.hairlineWidth,
                    backgroundColor: colorScheme === "dark" ? "#333" : "#eee",
                    marginLeft: 16,
                  }}
                />
              )}
            </View>
          ))
        )}
      </View>
    </View>
  );

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
            <View style={{ padding: 16, paddingBottom: 40 }}>
              {renderSection("Ingresos", "#4CAF50", "ingreso", ingresos)}
              <View style={{ height: 16 }} />
              {renderSection("Egresos", "#F44336", "egreso", egresos)}
              <Text style={[styles.hint, { color: colors.icon }]}>
                Tocá × o mantené presionado para eliminar
              </Text>
            </View>
          }
          renderItem={() => null}
          keyExtractor={() => ""}
        />
      )}

      {/* Modal nueva categoría */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
          />
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Nueva categoría de{" "}
              <Text
                style={{ color: newType === "ingreso" ? "#4CAF50" : "#F44336" }}
              >
                {newType}
              </Text>
            </Text>

            {/* Selector tipo */}
            <View style={styles.typeRow}>
              {(["ingreso", "egreso"] as TransactionType[]).map((t) => (
                <Pressable
                  key={t}
                  style={[
                    styles.typeChip,
                    newType === t && {
                      backgroundColor:
                        t === "ingreso" ? "#4CAF5020" : "#F4433620",
                      borderColor: t === "ingreso" ? "#4CAF50" : "#F44336",
                    },
                  ]}
                  onPress={() => setNewType(t)}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      {
                        color:
                          newType === t
                            ? t === "ingreso"
                              ? "#4CAF50"
                              : "#F44336"
                            : colors.icon,
                      },
                    ]}
                  >
                    {t === "ingreso" ? "Ingreso" : "Egreso"}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colorScheme === "dark" ? "#333" : "#ddd",
                  color: colors.text,
                  backgroundColor:
                    colorScheme === "dark" ? "#2a2a2a" : "#f9f9f9",
                },
              ]}
              placeholder="Nombre de la categoría"
              placeholderTextColor={colors.icon}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={onSave}
            />

            <Pressable
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={onSave}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>
                {saving ? "Guardando..." : "Guardar"}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingTop: 16,
  },
  sectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: "500",
  },
  addBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  sectionCard: {
    borderRadius: 10,
    overflow: "hidden",
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
  },
  itemText: {
    flex: 1,
    fontSize: 15,
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 8,
  },
  emptyText: {
    padding: 16,
    fontSize: 14,
    textAlign: "center",
  },
  hint: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    gap: 16,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  typeRow: {
    flexDirection: "row",
    gap: 10,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  typeChipText: {
    fontWeight: "600",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: "#2196F3",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

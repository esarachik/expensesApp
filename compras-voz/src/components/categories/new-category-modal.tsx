import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { insertCategory } from "@/services/category";
import type { TransactionType } from "@/types/transaction";

type Props = {
  visible: boolean;
  initialType?: TransactionType;
  onClose: () => void;
  onSaved: () => void;
};

export default function NewCategoryModal({
  visible,
  initialType = "egreso",
  onClose,
  onSaved,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<TransactionType>(initialType);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const name = newName.trim().toLowerCase();
    if (!name) {
      Alert.alert("Error", "Ingresá un nombre para la categoría");
      return;
    }
    setSaving(true);
    try {
      await insertCategory({ name, type: newType });
      setNewName("");
      onClose();
      onSaved();
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo guardar la categoría");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Nueva categoría de{" "}
            <Text
              style={{ color: newType === "ingreso" ? "#4CAF50" : "#F44336" }}
            >
              {newType}
            </Text>
          </Text>

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
                backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f9f9f9",
              },
            ]}
            placeholder="Nombre de la categoría"
            placeholderTextColor={colors.icon}
            value={newName}
            onChangeText={setNewName}
            autoFocus
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />

          <Pressable
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>
              {saving ? "Guardando..." : "Guardar"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
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
  title: {
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

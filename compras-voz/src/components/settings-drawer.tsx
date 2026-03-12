import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const DRAWER_WIDTH = Dimensions.get("window").width * 0.72;

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: "🏦", label: "Cuentas", route: "/(tabs)/accounts" },
  { icon: "🏷️", label: "Categorías", route: "/(tabs)/categories" },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ visible, onClose }: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 20,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleNavigate = (route: string) => {
    onClose();
    setTimeout(() => router.push(route as any), 400);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Overlay oscuro */}
      <Pressable style={styles.overlay} onPress={onClose} />

      {/* Panel deslizante */}
      <Animated.View
        style={[
          styles.drawer,
          { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "bottom"]}>
          <View style={styles.drawerHeader}>
            <Text style={[styles.drawerTitle, { color: colors.text }]}>
              Configuración
            </Text>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.icon }]}>
              GESTIÓN
            </Text>
            {MENU_ITEMS.map((item) => (
              <Pressable
                key={item.route}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && {
                    backgroundColor:
                      colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5",
                  },
                ]}
                onPress={() => handleNavigate(item.route)}
              >
                <Text style={styles.menuItemIcon}>{item.icon}</Text>
                <Text style={[styles.menuItemLabel, { color: colors.text }]}>
                  {item.label}
                </Text>
                <Text style={[styles.menuItemArrow, { color: colors.icon }]}>
                  ›
                </Text>
              </Pressable>
            ))}
          </View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 40,
    bottom: 50,
    width: DRAWER_WIDTH,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 16,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 18,
    color: "#999",
  },
  section: {
    paddingTop: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  menuItemIcon: {
    fontSize: 22,
    width: 28,
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  menuItemArrow: {
    fontSize: 22,
    fontWeight: "300",
  },
});

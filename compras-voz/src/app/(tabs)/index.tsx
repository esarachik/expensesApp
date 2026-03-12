import { AppHeader } from "@/components/app-header";
import VoiceRecorder from "@/components/voice-recorder";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom"]}>
      <AppHeader title="Compras Voz" />
      <VoiceRecorder />
    </SafeAreaView>
  );
}

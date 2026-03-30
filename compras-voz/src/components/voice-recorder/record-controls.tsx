import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

type Props = {
  isRecording: boolean;
  processing: boolean;
  hasPending: boolean;
  isPlaying: boolean;
  hasLastUri: boolean;
  onRecord: () => void;
  onTest: () => void;
  onPlayback: () => void;
};

export function RecordControls({
  isRecording,
  processing,
  hasPending,
  isPlaying,
  hasLastUri,
  onRecord,
  onTest,
  onPlayback,
}: Props) {
  return (
    <>
      <Pressable
        style={[styles.button, isRecording && styles.buttonRecording]}
        onPress={onRecord}
        disabled={processing}
      >
        <Text style={styles.buttonText}>
          {isRecording ? "⏹️ Detener" : "🎙️ Grabar"}
        </Text>
      </Pressable>

      {!isRecording && !processing && !hasPending && (
        <Pressable style={styles.buttonTest} onPress={onTest}>
          <Text style={styles.buttonTestText}>🧪 Prueba</Text>
        </Pressable>
      )}

      {processing && (
        <View style={styles.processingRow}>
          <ActivityIndicator color="#2196F3" />
          <Text style={styles.processingText}>Procesando audio...</Text>
        </View>
      )}

      {hasLastUri && !isRecording && !processing && (
        <Pressable style={styles.buttonSecondary} onPress={onPlayback}>
          <Text style={styles.buttonSecondaryText}>
            {isPlaying ? "⏹️ Parar" : "▶️ Escuchar"}
          </Text>
        </Pressable>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: "center",
  },
  buttonRecording: {
    backgroundColor: "#F44336",
  },
  buttonTest: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FF9800",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonTestText: {
    color: "#FF9800",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#2196F3",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonSecondaryText: {
    color: "#2196F3",
    fontSize: 14,
  },
  processingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  processingText: {
    color: "#666",
    fontSize: 14,
  },
});

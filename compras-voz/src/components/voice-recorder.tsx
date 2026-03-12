import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getAccountsByMonth } from "../services/account";
import { parseTransaction } from "../services/openai";
import { insertTransaction } from "../services/transaction";
import { transcribeAudio } from "../services/whisper";
import type { Account } from "../types/account";
import type { Transaction } from "../types/transaction";

export default function VoiceRecorder() {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [lastUri, setLastUri] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Transaction | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  // Estado para confirmación: datos pendientes antes de guardar
  const [pendingTransaction, setPendingTransaction] =
    useState<Transaction | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);

  const player = useAudioPlayer(lastUri);
  const playerStatus = useAudioPlayerStatus(player);

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      console.log(
        "Permiso de micrófono:",
        status.granted ? "CONCEDIDO" : "DENEGADO",
      );
      if (!status.granted) {
        console.warn("Permiso de micrófono denegado");
      }
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  const onRecord = async () => {
    if (!recorderState.isRecording) {
      setResult(null);
      setTranscription(null);
      console.log("Iniciando grabación...");
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      console.log("Grabando...");
    } else {
      console.log("Deteniendo grabación...");
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      setLastUri(uri);
      console.log("Audio guardado en:", uri);

      if (uri) {
        await processAudio(uri);
      }
    }
  };

  const processAudio = async (uri: string) => {
    setProcessing(true);
    try {
      // Paso 1: Whisper → texto
      const text = await transcribeAudio(uri);
      setTranscription(text);
      console.log("Transcripción:", text);

      // Paso 2: GPT → datos estructurados
      const parsed = await parseTransaction(text);
      const transaction: Transaction = { ...parsed, originalText: text };

      // Paso 3: Mostrar para confirmación (no guardar aún)
      const yearMonth = transaction.date.substring(0, 7);
      const accs = await getAccountsByMonth(yearMonth);
      setAvailableAccounts(accs);
      setPendingTransaction({ ...transaction, accountId: null });
      setSelectedDate(new Date(transaction.date + "T12:00:00"));
      setResult(null);
      console.log(
        "Transacción pendiente de confirmación:",
        JSON.stringify(transaction, null, 2),
      );
    } catch (error: any) {
      console.error("Error procesando audio:", error);
      Alert.alert("Error", error.message ?? "No se pudo procesar el audio");
    } finally {
      setProcessing(false);
    }
  };

  const onDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios"); // iOS mantiene abierto, Android cierra al seleccionar
    if (date && pendingTransaction) {
      setSelectedDate(date);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      setPendingTransaction({
        ...pendingTransaction,
        date: `${yyyy}-${mm}-${dd}`,
      });
    }
  };

  const onConfirm = async () => {
    if (!pendingTransaction) return;
    setSaving(true);
    try {
      const id = await insertTransaction(pendingTransaction);
      const saved = { ...pendingTransaction, id };
      setResult(saved);
      setPendingTransaction(null);
      console.log(
        "Transacción guardada (id=%d):",
        id,
        JSON.stringify(saved, null, 2),
      );
    } catch (error: any) {
      console.error("Error guardando transacción:", error);
      Alert.alert(
        "Error",
        error.message ?? "No se pudo guardar la transacción",
      );
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    setPendingTransaction(null);
    setTranscription(null);
    console.log("Transacción cancelada");
  };

  const onTestTransaction = () => {
    const today = new Date().toISOString().split("T")[0];
    const yearMonth = today.substring(0, 7);
    const mock: Transaction = {
      date: today,
      amount: 1500,
      type: "egreso",
      category: "supermercado",
      description: "Compra de prueba",
      originalText: "(datos de prueba)",
      accountId: null,
    };
    setTranscription("(datos de prueba)");
    setPendingTransaction(mock);
    setSelectedDate(new Date(today + "T12:00:00"));
    setResult(null);
    getAccountsByMonth(yearMonth)
      .then(setAvailableAccounts)
      .catch(() => {});
  };

  const onPlayback = () => {
    if (!lastUri) return;
    if (playerStatus.playing) {
      player.pause();
    } else {
      player.seekTo(0);
      player.play();
    }
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable
        style={[
          styles.button,
          recorderState.isRecording && styles.buttonRecording,
        ]}
        onPress={onRecord}
        disabled={processing}
      >
        <Text style={styles.buttonText}>
          {recorderState.isRecording ? "⏹️ Detener" : "🎙️ Grabar"}
        </Text>
      </Pressable>

      {!recorderState.isRecording && !processing && !pendingTransaction && (
        <Pressable style={styles.buttonTest} onPress={onTestTransaction}>
          <Text style={styles.buttonTestText}>🧪 Prueba</Text>
        </Pressable>
      )}

      {processing && (
        <View style={styles.processingRow}>
          <ActivityIndicator color="#2196F3" />
          <Text style={styles.processingText}>Procesando audio...</Text>
        </View>
      )}

      {lastUri && !recorderState.isRecording && !processing && (
        <Pressable style={styles.buttonSecondary} onPress={onPlayback}>
          <Text style={styles.buttonSecondaryText}>
            {playerStatus.playing ? "⏹️ Parar" : "▶️ Escuchar"}
          </Text>
        </Pressable>
      )}

      {transcription && !pendingTransaction && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Transcripción:</Text>
          <Text style={styles.cardText}>"{transcription}"</Text>
        </View>
      )}

      {pendingTransaction && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Confirmar transacción</Text>

          {transcription && (
            <Text style={[styles.cardText, { marginBottom: 8 }]}>
              "{transcription}"
            </Text>
          )}

          <Text style={styles.resultLine}>
            {pendingTransaction.type === "ingreso" ? "💰" : "💸"}{" "}
            <Text
              style={[
                styles.badge,
                pendingTransaction.type === "ingreso"
                  ? styles.badgeIngreso
                  : styles.badgeEgreso,
              ]}
            >
              {pendingTransaction.type.toUpperCase()}
            </Text>
          </Text>
          <Text style={styles.resultLine}>
            💲 ${pendingTransaction.amount.toLocaleString()}
          </Text>
          <Text style={styles.resultLine}>
            📁 {pendingTransaction.category}
          </Text>
          <Text style={styles.resultLine}>
            📝 {pendingTransaction.description}
          </Text>

          <Pressable
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              📅 {pendingTransaction.date}
            </Text>
            <Text style={styles.dateButtonHint}>Toca para cambiar</Text>
          </Pressable>

          {availableAccounts.length > 0 && (
            <View style={styles.accountSection}>
              <Text style={styles.accountLabel}>Cuenta</Text>
              <View style={styles.accountChips}>
                <Pressable
                  style={[
                    styles.accountChip,
                    !pendingTransaction.accountId && styles.accountChipActive,
                  ]}
                  onPress={() =>
                    setPendingTransaction({
                      ...pendingTransaction,
                      accountId: null,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.accountChipText,
                      !pendingTransaction.accountId &&
                        styles.accountChipTextActive,
                    ]}
                  >
                    Sin cuenta
                  </Text>
                </Pressable>
                {availableAccounts.map((acc) => (
                  <Pressable
                    key={acc.id}
                    style={[
                      styles.accountChip,
                      pendingTransaction.accountId === acc.id &&
                        styles.accountChipActive,
                    ]}
                    onPress={() =>
                      setPendingTransaction({
                        ...pendingTransaction,
                        accountId: acc.id,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.accountChipText,
                        pendingTransaction.accountId === acc.id &&
                          styles.accountChipTextActive,
                      ]}
                    >
                      {acc.type === "bank" ? "🏦" : "💳"} {acc.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          <View style={styles.confirmRow}>
            <Pressable
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>❌ Cancelar</Text>
            </Pressable>
            <Pressable
              style={styles.confirmButton}
              onPress={onConfirm}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>✅ Guardar</Text>
              )}
            </Pressable>
          </View>
        </View>
      )}

      {result && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>✅ Guardado</Text>
          <Text style={styles.resultLine}>
            {result.type === "ingreso" ? "💰" : "💸"}{" "}
            <Text
              style={[
                styles.badge,
                result.type === "ingreso"
                  ? styles.badgeIngreso
                  : styles.badgeEgreso,
              ]}
            >
              {result.type.toUpperCase()}
            </Text>
          </Text>
          <Text style={styles.resultLine}>📅 {result.date}</Text>
          <Text style={styles.resultLine}>
            💲 ${result.amount.toLocaleString()}
          </Text>
          <Text style={styles.resultLine}>📁 {result.category}</Text>
          <Text style={styles.resultLine}>📝 {result.description}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: "100%",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 20,
    paddingBottom: 40,
  },
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
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    gap: 6,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  cardText: {
    fontSize: 15,
    color: "#333",
    fontStyle: "italic",
  },
  resultLine: {
    fontSize: 16,
    color: "#333",
  },
  badge: {
    fontWeight: "700",
    fontSize: 14,
  },
  badgeIngreso: {
    color: "#4CAF50",
  },
  badgeEgreso: {
    color: "#F44336",
  },
  dateButton: {
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1976D2",
  },
  dateButtonHint: {
    fontSize: 11,
    color: "#90A4AE",
    marginTop: 2,
  },
  confirmRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  accountSection: {
    marginTop: 8,
  },
  accountLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  accountChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  accountChip: {
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  accountChipActive: {
    borderColor: "#2196F3",
    backgroundColor: "#e3f2fd",
  },
  accountChipText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  accountChipTextActive: {
    color: "#1976D2",
    fontWeight: "700",
  },
});

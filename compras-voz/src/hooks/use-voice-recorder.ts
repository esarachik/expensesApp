import { getAccountsByMonth } from "@/services/account";
import { parseTransaction } from "@/services/openai";
import { insertTransaction } from "@/services/transaction";
import { transcribeAudio } from "@/services/whisper";
import type { Account } from "@/types/account";
import type { Transaction } from "@/types/transaction";
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
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
import { Alert, Platform } from "react-native";

export function useVoiceRecorder() {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [lastUri, setLastUri] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Transaction | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
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

  const processAudio = async (uri: string) => {
    setProcessing(true);
    try {
      const text = await transcribeAudio(uri);
      console.log("[VoiceRecorder] transcribeAudio result:", text);
      if (!text) {
        Alert.alert(
          "No se entendió",
          "No se pudo entender la grabación. Intentá hablar más claro o acercá el micrófono.",
        );
        return;
      }
      setTranscription(text);
      console.log("Transcripción:", text);

      const parsed = await parseTransaction(text);
      if (!parsed) {
        Alert.alert(
          "No es una transacción",
          'El texto no parece ser una transacción financiera. Intentá decir algo como "gasté 500 en el super".',
        );
        return;
      }
      const transaction: Transaction = { ...parsed, originalText: text };

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

  const onDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
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
    getAccountsByMonth(yearMonth).then(setAvailableAccounts).catch(() => {});
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

  return {
    recorderState,
    lastUri,
    processing,
    result,
    transcription,
    pendingTransaction,
    setPendingTransaction,
    selectedDate,
    showDatePicker,
    setShowDatePicker,
    saving,
    availableAccounts,
    playerStatus,
    onRecord,
    onDateChange,
    onConfirm,
    onCancel,
    onTestTransaction,
    onPlayback,
  };
}

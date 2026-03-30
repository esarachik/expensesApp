import { PendingTransactionCard } from "@/components/voice-recorder/pending-transaction-card";
import { RecordControls } from "@/components/voice-recorder/record-controls";
import { ResultCard } from "@/components/voice-recorder/result-card";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function VoiceRecorder() {
  const {
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
  } = useVoiceRecorder();

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <RecordControls
        isRecording={recorderState.isRecording}
        processing={processing}
        hasPending={!!pendingTransaction}
        isPlaying={playerStatus.playing}
        hasLastUri={!!lastUri}
        onRecord={onRecord}
        onTest={onTestTransaction}
        onPlayback={onPlayback}
      />

      {transcription && !pendingTransaction && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Transcripción:</Text>
          <Text style={styles.cardText}>"{transcription}"</Text>
        </View>
      )}

      {pendingTransaction && (
        <PendingTransactionCard
          transaction={pendingTransaction}
          transcription={transcription}
          selectedDate={selectedDate}
          showDatePicker={showDatePicker}
          saving={saving}
          availableAccounts={availableAccounts}
          onDateChange={onDateChange}
          onShowDatePicker={() => setShowDatePicker(true)}
          onSelectAccount={(id) =>
            setPendingTransaction({ ...pendingTransaction, accountId: id })
          }
          onSelectCategory={(category) =>
            setPendingTransaction({ ...pendingTransaction, category })
          }
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      )}

      {result && <ResultCard transaction={result} />}
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
});

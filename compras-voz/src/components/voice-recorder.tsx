import { PendingTransactionCard } from "@/components/voice-recorder/pending-transaction-card";
import { RecordControls } from "@/components/voice-recorder/record-controls";
import { ResultCard } from "@/components/voice-recorder/result-card";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";

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
    onSelectType,
    onDateChange,
    onConfirm,
    onCancel,
    onTestTransaction,
    onPlayback,
  } = useVoiceRecorder();

  return (
    <View style={styles.container}>
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

      {result && <ResultCard transaction={result} />}

      <Modal visible={!!pendingTransaction} animationType="slide" transparent onRequestClose={onCancel}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
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
                    setPendingTransaction({
                      ...pendingTransaction,
                      accountId: id,
                    })
                  }
                  onSelectCategory={(category) => setPendingTransaction({ ...pendingTransaction, category })}
                  onSelectType={onSelectType}
                  onChangeAmount={(raw) => {
                    const n = parseFloat(raw.replace(",", "."));
                    if (!isNaN(n))
                      setPendingTransaction({
                        ...pendingTransaction,
                        amount: n,
                      });
                  }}
                  onChangeDescription={(description) =>
                    setPendingTransaction({
                      ...pendingTransaction,
                      description,
                    })
                  }
                  onConfirm={onConfirm}
                  onCancel={onCancel}
                />
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
    maxHeight: "90%",
  },
});

import { useState, useEffect } from 'react';
import { Pressable, Text, View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import {
  useAudioRecorder,
  useAudioRecorderState,
  useAudioPlayer,
  useAudioPlayerStatus,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from 'expo-audio';
import { transcribeAudio } from '../services/whisper';
import { parseTransaction } from '../services/openai';
import { insertTransaction } from '../services/database';
import type { Transaction } from '../types/transaction';

export default function VoiceRecorder() {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [lastUri, setLastUri] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Transaction | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);

  const player = useAudioPlayer(lastUri);
  const playerStatus = useAudioPlayerStatus(player);

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      console.log('Permiso de micrófono:', status.granted ? 'CONCEDIDO' : 'DENEGADO');
      if (!status.granted) {
        console.warn('Permiso de micrófono denegado');
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
      console.log('Iniciando grabación...');
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      console.log('Grabando...');
    } else {
      console.log('Deteniendo grabación...');
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      setLastUri(uri);
      console.log('Audio guardado en:', uri);

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
      console.log('Transcripción:', text);

      // Paso 2: GPT → datos estructurados
      const parsed = await parseTransaction(text);
      const transaction: Transaction = { ...parsed, originalText: text };

      // Paso 3: Guardar en SQLite
      const id = await insertTransaction(transaction);
      transaction.id = id;
      setResult(transaction);
      console.log('Transacción guardada (id=%d):', id, JSON.stringify(transaction, null, 2));
    } catch (error: any) {
      console.error('Error procesando audio:', error);
      Alert.alert('Error', error.message ?? 'No se pudo procesar el audio');
    } finally {
      setProcessing(false);
    }
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
    <View style={styles.container}>
      <Pressable
        style={[styles.button, recorderState.isRecording && styles.buttonRecording]}
        onPress={onRecord}
        disabled={processing}
      >
        <Text style={styles.buttonText}>
          {recorderState.isRecording ? '⏹️ Detener' : '🎙️ Grabar'}
        </Text>
      </Pressable>

      {processing && (
        <View style={styles.processingRow}>
          <ActivityIndicator color="#2196F3" />
          <Text style={styles.processingText}>Procesando audio...</Text>
        </View>
      )}

      {lastUri && !recorderState.isRecording && !processing && (
        <Pressable style={styles.buttonSecondary} onPress={onPlayback}>
          <Text style={styles.buttonSecondaryText}>
            {playerStatus.playing ? '⏹️ Parar' : '▶️ Escuchar'}
          </Text>
        </Pressable>
      )}

      {transcription && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Transcripción:</Text>
          <Text style={styles.cardText}>"{transcription}"</Text>
        </View>
      )}

      {result && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Resultado:</Text>
          <Text style={styles.resultLine}>
            {result.type === 'ingreso' ? '💰' : '💸'}{' '}
            <Text style={[styles.badge, result.type === 'ingreso' ? styles.badgeIngreso : styles.badgeEgreso]}>
              {result.type.toUpperCase()}
            </Text>
          </Text>
          <Text style={styles.resultLine}>📅 {result.date}</Text>
          <Text style={styles.resultLine}>💲 ${result.amount.toLocaleString()}</Text>
          <Text style={styles.resultLine}>📁 {result.category}</Text>
          <Text style={styles.resultLine}>📝 {result.description}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
    padding: 20,
    width: '100%',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonRecording: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonSecondaryText: {
    color: '#2196F3',
    fontSize: 14,
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  processingText: {
    color: '#666',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    gap: 6,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 15,
    color: '#333',
    fontStyle: 'italic',
  },
  resultLine: {
    fontSize: 16,
    color: '#333',
  },
  badge: {
    fontWeight: '700',
    fontSize: 14,
  },
  badgeIngreso: {
    color: '#4CAF50',
  },
  badgeEgreso: {
    color: '#F44336',
  },
});

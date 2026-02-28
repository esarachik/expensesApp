import { Platform } from 'react-native';
import { OPENAI_API_KEY, OPENAI_BASE_URL } from '../constants/config';

/**
 * Envía el archivo de audio a OpenAI Whisper y devuelve el texto transcrito.
 */
export async function transcribeAudio(audioUri: string): Promise<string> {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    // En web: convertir el URI (blob: o data:) a un File real
    const res = await fetch(audioUri);
    const blob = await res.blob();
    const file = new File([blob], 'recording.webm', { type: blob.type || 'audio/webm' });
    formData.append('file', file);
  } else {
    // En native (iOS/Android): React Native acepta este formato
    formData.append('file', {
      uri: audioUri,
      name: 'recording.m4a',
      type: 'audio/m4a',
    } as any);
  }

  formData.append('model', 'whisper-1');
  formData.append('language', 'es');

  const response = await fetch(`${OPENAI_BASE_URL}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      // No setear Content-Type: fetch lo hace automáticamente con el boundary
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Whisper API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.text;
}

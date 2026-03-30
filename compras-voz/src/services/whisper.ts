import { OPENAI_API_KEY, OPENAI_BASE_URL } from '../constants/config';

/**
 * Envía el archivo de audio a OpenAI Whisper y devuelve el texto transcrito.
 */
export async function transcribeAudio(audioUri: string): Promise<string | null> {
  const formData = new FormData();    
  formData.append('file', {
    uri: audioUri,
    name: 'recording.m4a',
    type: 'audio/m4a',
  } as any);


  formData.append('model', 'whisper-1');
  formData.append('language', 'es');
  formData.append('response_format', 'verbose_json');

  const response = await fetch(`${OPENAI_BASE_URL}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,      
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Whisper API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const text: string = (data.text ?? '').trim();
    
  const segments = data.segments ?? [];    
  const isNoise = segments.length > 0 && segments.every((s: any) => s.no_speech_prob > 0.8);  
  
  if (isNoise === true) {
    return null;
  }
  
  return text;
}

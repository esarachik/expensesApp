import { View } from 'react-native';
import VoiceRecorder from '@/components/voice-recorder';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <VoiceRecorder />
    </View>
  );
}
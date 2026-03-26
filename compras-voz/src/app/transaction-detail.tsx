import { useLocalSearchParams, useRouter } from 'expo-router';
import { TransactionDetail } from '@/screens/transaction-detail';

export default function TransactionModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    date: string;
    amount: string;
    type: string;
    category: string;
    description: string;
    originalText: string;
  }>();

  return (
    <TransactionDetail 
      transaction={params as any}
      onDelete={() => router.back()}
    />
  );
}

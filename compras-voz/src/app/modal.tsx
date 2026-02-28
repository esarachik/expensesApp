import { useLocalSearchParams, useRouter } from 'expo-router';
import { TransactionDetail } from '@/screens/transaction-detail';

export default function TransactionModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    fecha: string;
    monto: string;
    tipo: string;
    categoria: string;
    descripcion: string;
    textoOriginal: string;
    creadoEn: string;
  }>();

  return (
    <TransactionDetail 
      transaction={params as any}
      onDelete={() => router.back()}
    />
  );
}

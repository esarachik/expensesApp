import { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Modal } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { deleteTransaction } from '@/services/database';
import { useRouter } from 'expo-router';

interface TransactionParams {
  id: string;
  fecha: string;
  monto: string;
  tipo: string;
  categoria: string;
  descripcion: string;
  textoOriginal: string;
  creadoEn: string;
}

interface TransactionDetailProps {
  transaction: TransactionParams;
  onDelete?: () => void;
}

export function TransactionDetail({ transaction, onDelete }: TransactionDetailProps) {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [showConfirm, setShowConfirm] = useState(false);

  const isIngreso = transaction.tipo === 'ingreso';

  const handleDelete = () => setShowConfirm(true);

  const confirmDelete = async () => {
    await deleteTransaction(Number(transaction.id));
    setShowConfirm(false);
    onDelete?.();
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tipo y monto */}
      <View style={styles.header}>
        <Text style={styles.icon}>{isIngreso ? '💰' : '💸'}</Text>
        <Text
          style={[
            styles.amount,
            { color: isIngreso ? '#4CAF50' : '#F44336' },
          ]}
        >
          {isIngreso ? '+' : '-'}${Number(transaction.monto).toLocaleString()}
        </Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: isIngreso ? '#E8F5E9' : '#FFEBEE' },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: isIngreso ? '#4CAF50' : '#F44336' },
            ]}
          >
            {transaction.tipo?.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Detalles */}
      <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#f5f5f5' }]}>
        <DetailRow label="Fecha" value={transaction.fecha} color={colors} />
        <DetailRow label="Categoría" value={transaction.categoria} color={colors} />
        <DetailRow label="Descripción" value={transaction.descripcion} color={colors} />
        <DetailRow label="Texto original" value={transaction.textoOriginal} color={colors} />
        {transaction.creadoEn ? (
          <DetailRow label="Registrado" value={transaction.creadoEn} color={colors} />
        ) : null}
      </View>

      {/* Acciones */}
      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>🗑️ Eliminar transacción</Text>
      </Pressable>

      {/* Confirmación de eliminación */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.overlay}>
          <View style={[styles.dialog, { backgroundColor: colorScheme === 'dark' ? '#2c2c2c' : '#fff' }]}>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>Eliminar</Text>
            <Text style={[styles.dialogMessage, { color: colors.text }]}>
              ¿Seguro que querés eliminar esta transacción?
            </Text>
            <View style={styles.dialogActions}>
              <Pressable
                style={[styles.dialogButton, styles.cancelButton]}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={[styles.dialogButtonText, { color: colors.text }]}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.dialogButton, styles.confirmDeleteButton]}
                onPress={confirmDelete}
              >
                <Text style={[styles.dialogButtonText, { color: '#fff' }]}>Eliminar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DetailRow({
  label,
  value,
  color,
}: {
  label: string;
  value?: string;
  color: { text: string; icon: string };
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: color.icon }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: color.text }]}>
        {value || '—'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  icon: {
    fontSize: 48,
  },
  amount: {
    fontSize: 36,
    fontWeight: '800',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    gap: 14,
  },
  detailRow: {
    gap: 2,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 15,
  },
  deleteButton: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FFEBEE',
  },
  deleteButtonText: {
    color: '#F44336',
    fontSize: 15,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  dialog: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
    gap: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  dialogMessage: {
    fontSize: 15,
    lineHeight: 22,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  dialogButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  confirmDeleteButton: {
    backgroundColor: '#F44336',
  },
  dialogButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

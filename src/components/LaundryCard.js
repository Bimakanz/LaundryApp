import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getSoftShadow } from '../constants/colors';
import StatusBar from './StatusBar';

function formatRupiah(num) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(num);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function LaundryCard({ transaction, onPress }) {
  const paid = transaction.payment_status === 'paid';
  
  return (
    <View style={[styles.outerContainer, getSoftShadow(true)]}>
      <View style={[styles.innerHighlight, getSoftShadow(false)]}>
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
          <View style={styles.header}>
            <View>
              <Text style={styles.invoice}>{transaction.invoice_code}</Text>
              <Text style={styles.date}>{formatDate(transaction.created_at)}</Text>
            </View>
          </View>

          <View style={styles.serviceBox}>
            <Ionicons name="shirt-outline" size={16} color="#777" />
            <Text style={styles.serviceText}>
              {transaction.service?.service_name} · {Number(transaction.quantity)} {transaction.service?.unit}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatRupiah(transaction.total_price)}</Text>
            <View style={[styles.badge, { backgroundColor: paid ? '#D1FAE5' : '#FEF3C7' }]}>
               <Text style={[styles.badgeText, { color: paid ? '#065F46' : '#92400E' }]}>
                 {paid ? 'LUNAS' : 'PENDING'}
               </Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>PROGRESS PELACAKAN</Text>
            <StatusBar currentStatus={transaction.status} variant="compact" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: 24,
    marginVertical: 14,
    borderRadius: 32,
    backgroundColor: COLORS.bg,
  },
  innerHighlight: {
    borderRadius: 32,
    backgroundColor: COLORS.bg,
  },
  card: {
    padding: 24,
    borderRadius: 32,
    backgroundColor: COLORS.bg,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  invoice: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#555' },
  date: { fontSize: 12, color: '#999', marginTop: 2 },
  statusPill: { backgroundColor: '#E2E8F0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusText: { fontSize: 10, fontFamily: 'Poppins-ExtraBold', color: '#666' },
  serviceBox: { 
    backgroundColor: COLORS.bg, borderRadius: 16, padding: 16, 
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)',
    // Inset-like look for web
    ...Platform.select({ web: { boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.8)' } })
  },
  serviceText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#666' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  price: { fontSize: 20, fontFamily: 'Poppins-Bold', color: COLORS.primary },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  badgeText: { fontSize: 11, fontFamily: 'Poppins-Bold' },
  progressSection: { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 16 },
  progressTitle: { fontSize: 10, fontFamily: 'Poppins-Bold', color: '#999', marginBottom: 8, letterSpacing: 1 }
});

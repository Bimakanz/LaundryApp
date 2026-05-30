import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const paid = transaction.payment_status === 'paid';
  
  return (
    <View style={{ 
      marginHorizontal: 24, 
      marginVertical: 6, 
      borderRadius: 16, 
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      ...getSoftShadow(true)
    }}>
      <TouchableOpacity style={{ padding: 16, borderRadius: 16 }} onPress={onPress} activeOpacity={0.8}>
          {/* Top Row: Invoice & Date (Left) | Payment Status (Right) */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 15, fontFamily: 'PlusJakartaSans-Bold', color: '#555' }}>{transaction.invoice_code}</Text>
              <Text style={{ fontSize: 10, color: '#999', fontFamily: 'PlusJakartaSans-Medium' }}>({formatDate(transaction.created_at)})</Text>
            </View>
            <View style={[{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }, { backgroundColor: paid ? '#D1FAE5' : '#FEF3C7' }]}>
               <Text style={[{ fontSize: 9, fontFamily: 'PlusJakartaSans-Bold' }, { color: paid ? '#065F46' : '#92400E' }]}>
                 {paid ? 'LUNAS' : 'PENDING'}
               </Text>
            </View>
          </View>

          {/* Middle Row: Service Details (Left) | Price (Right) */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 12 }}>
              <Ionicons name="shirt-outline" size={14} color="#777" />
              <Text style={{ fontSize: 12, fontFamily: 'PlusJakartaSans-SemiBold', color: '#666' }} numberOfLines={1}>
                {transaction.service?.service_name} · {Number(transaction.quantity)} {transaction.service?.unit}
              </Text>
            </View>
            <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans-Bold', color: COLORS.primary }}>{formatRupiah(transaction.total_price)}</Text>
          </View>

          {/* Collapsible Tracking Progress */}
          <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', marginTop: 8, paddingTop: 6 }}>
            <TouchableOpacity 
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
              onPress={() => setIsExpanded(!isExpanded)}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 9, fontFamily: 'PlusJakartaSans-Bold', color: '#999' }}>PROGRESS PELACAKAN</Text>
              <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#999" />
            </TouchableOpacity>
            {isExpanded && (
              <View style={{ marginTop: 8 }}>
                <StatusBar currentStatus={transaction.status} variant="compact" />
              </View>
            )}
          </View>
        </TouchableOpacity>
    </View>
  );
}



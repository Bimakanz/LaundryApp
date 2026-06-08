import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Platform, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, getSoftShadow } from '../../src/constants/colors';
import { getMyLaundry } from '../../src/api/transactions';
import { getMyNotifications } from '../../src/api/notifications';
import LaundryCard from '../../src/components/LaundryCard';
import { useToast } from '../../src/context/ToastContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';

const GradientText = ({ children, style, ...props }: any) => {
  const flatStyle = StyleSheet.flatten(style) || {};
  const {
    fontSize = 24,
    fontFamily = 'PlusJakartaSans-Bold',
    fontWeight,
    marginTop,
    marginBottom,
    marginVertical,
    marginHorizontal,
    marginLeft,
    marginRight,
    margin,
    ...textStyle
  } = flatStyle;

  const layoutStyle = {
    marginTop,
    marginBottom,
    marginVertical,
    marginHorizontal,
    marginLeft,
    marginRight,
    margin,
  };

  const finalTextStyle = {
    fontSize,
    fontFamily,
    fontWeight,
    ...textStyle,
  };

  if (Platform.OS === 'web') {
    return (
      <Text
        style={[
          finalTextStyle,
          layoutStyle,
          {
            // @ts-ignore
            backgroundImage: 'linear-gradient(to right, #56C3E2, #7DD3FC)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
            display: 'inline-block',
          },
        ]}
        {...props}
      >
        {children}
      </Text>
    );
  }

  return (
    <View style={[{ flexDirection: 'row' }, layoutStyle]}>
      <MaskedView
        style={{ flex: 1, height: fontSize * 1.4 }}
        maskElement={
          <Text style={[finalTextStyle, { backgroundColor: 'transparent' }]} {...props}>
            {children}
          </Text>
        }
      >
        <LinearGradient
          colors={['#56C3E2', '#7DD3FC']} // Gradasi Sky Blue (Brand ke Light Blue)
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        >
          <Text style={[finalTextStyle, { opacity: 0 }]} {...props}>
            {children}
          </Text>
        </LinearGradient>
      </MaskedView>
    </View>
  );
};

export default function DashboardScreen() {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();

  // Reload data (User, Transactions, & Unread Notifications) whenever screen is focused and poll periodically
  useFocusEffect(
    useCallback(() => {
      loadUser();
      fetchData();
      fetchUnreadCount();

      // Poll every 10 seconds for real-time status updates from admin
      const interval = setInterval(() => {
        fetchData();
        fetchUnreadCount();
      }, 10000);

      return () => clearInterval(interval);
    }, [])
  );

  const loadUser = async () => {
    try { const u = await AsyncStorage.getItem('bilas_user'); if (u) setUser(JSON.parse(u)); } catch {}
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await getMyNotifications() as any;
      if (res.success && res.data) {
        const unread = res.data.filter((n: any) => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.log('Error fetching notifications:', err);
    }
  };

  const fetchData = async () => {
    try {
      const res = await getMyLaundry() as any;
      if (res.success) {
        setTransactions(res.data || []);
      } else {
        showToast(res.message || 'Gagal memuat cucian.', 'error');
        setTransactions([]);
      }
    } catch (err) {
      console.log('Error:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => { 
    setRefreshing(true); 
    fetchData(); 
    fetchUnreadCount();
  }, []);

  const totalCucian = transactions.length;
  const aktif = transactions.filter(t => t.status !== 'diambil').length;
  const diambil = transactions.filter(t => t.status === 'diambil').length;

  // Process stage counts (based on raw transactions data)
  const antrianCount = transactions.filter(t => t.status === 'antrian').length;
  const dicuciCount = transactions.filter(t => t.status === 'dicuci').length;
  const disetrikaCount = transactions.filter(t => t.status === 'disetrika').length;
  const siapCount = transactions.filter(t => t.status === 'siap diambil').length;
  const selesaiCount = diambil;

  // Search and status filtering
  const filteredTransactions = transactions.filter(item => {
    // 1. Filter by selected status card
    if (selectedStatus && item.status !== selectedStatus) {
      return false;
    }

    // 2. Filter by search query text
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    const matchesInvoice = item.invoice_code?.toLowerCase().includes(query);
    
    const matchesStatus = item.status?.toLowerCase().includes(query) || 
      (query === 'antre' || query === 'antrian' ? item.status === 'antrian' : false) ||
      (query === 'cuci' || query === 'dicuci' ? item.status === 'dicuci' : false) ||
      (query === 'setrika' || query === 'disetrika' ? item.status === 'disetrika' : false) ||
      (query === 'siap' || query === 'siap diambil' ? item.status === 'siap diambil' : false) ||
      (query === 'selesai' || query === 'diambil' ? item.status === 'diambil' : false);
      
    const matchesPayment = item.payment_status?.toLowerCase().includes(query) ||
      (query === 'lunas' ? item.payment_status === 'paid' : false) ||
      (query === 'pending' || query === 'belum lunas' ? item.payment_status === 'unpaid' : false);
      
    return matchesInvoice || matchesStatus || matchesPayment;
  });

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView 
        contentContainerStyle={[{ paddingBottom: insets.bottom + 32 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Modern Top Header wrapper */}
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingBottom: 20,
            paddingHorizontal: 24,
            backgroundColor: '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: '#E2E8F0',
            ...getSoftShadow(true)
          }}
        >
          {/* Top Greeting Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity 
              activeOpacity={0.7} 
              onPress={() => router.push('/profile')}
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 16 }}
            >
              <LinearGradient
                colors={['#56C3E2', '#7DD3FC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans-Bold', color: '#FFFFFF' }}>
                  {user?.name ? user.name.split(' ').map((w: any) => w[0]).join('').toUpperCase().slice(0, 2) : 'P'}
                </Text>
              </LinearGradient>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 11, fontFamily: 'PlusJakartaSans-Medium', color: '#94A3B8' }}>Selamat datang,</Text>
                <Text style={{ fontSize: 16, fontFamily: 'PlusJakartaSans-Bold', color: '#1E293B', marginTop: 1 }} numberOfLines={1}>
                  {user?.name || 'Pelanggan'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Notification Button */}
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => router.push('/notifications')}
              style={{ 
                width: 44, 
                height: 44, 
                borderRadius: 22, 
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#E2E8F0',
                alignItems: 'center', 
                justifyContent: 'center',
                ...getSoftShadow(true)
              }}
            >
              <Ionicons name="notifications-outline" size={22} color="#475569" />
              {unreadCount > 0 && (
                <View style={{ 
                  position: 'absolute', 
                  top: 2, 
                  right: 2, 
                  backgroundColor: '#EF4444', 
                  minWidth: 16, 
                  height: 16, 
                  borderRadius: 8, 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  paddingHorizontal: 4,
                  borderWidth: 1,
                  borderColor: '#FFFFFF'
                }}>
                  <Text style={{ fontSize: 8, fontFamily: 'PlusJakartaSans-Bold', color: '#FFF' }}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Middle Section: Active Order Tracker Banner Card */}
          <LinearGradient
            colors={['#56C3E2', '#7DD3FC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ 
              marginVertical: 16, 
              borderRadius: 20, 
              padding: 20, 
              position: 'relative',
              overflow: 'hidden',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              ...getSoftShadow(true)
            }}
          >
            {/* Translucent decorative bubbles for premium design styling */}
            <View style={{ position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />
            <View style={{ position: 'absolute', left: -20, bottom: -40, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />

            <View style={{ flex: 1, marginRight: 16, zIndex: 1 }}>
              <Text style={{ fontSize: 9, fontFamily: 'PlusJakartaSans-Bold', color: 'rgba(255, 255, 255, 0.75)', letterSpacing: 1, textTransform: 'uppercase' }}>
                STATUS CUCIAN
              </Text>
              <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: '#FFFFFF', marginTop: 4 }}>
                {aktif > 0 ? `Ada ${aktif} Cucian Aktif` : 'Semua Cucian Selesai'}
              </Text>
              <Text style={{ fontSize: 12, fontFamily: 'PlusJakartaSans-Medium', color: 'rgba(255, 255, 255, 0.85)', marginTop: 4, lineHeight: 16 }}>
                {aktif > 0 ? 'Pakaian Anda sedang dalam pengerjaan.' : 'Pakaian Anda bersih, rapi, dan siap dipakai!'}
              </Text>
              
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => setSelectedStatus(null)}
                style={{ 
                  marginTop: 14, 
                  paddingVertical: 8, 
                  paddingHorizontal: 16, 
                  backgroundColor: 'rgba(255, 255, 255, 0.25)', 
                  borderRadius: 20, 
                  alignSelf: 'flex-start',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.4)'
                }}
              >
                <Text style={{ fontSize: 11, fontFamily: 'PlusJakartaSans-Bold', color: '#FFFFFF' }}>
                  {aktif > 0 ? 'Lacak Cucian' : 'Lihat Transaksi'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ 
              width: 58, 
              height: 58, 
              borderRadius: 29, 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
              zIndex: 1
            }}>
              <Ionicons name="shirt-outline" size={26} color="#FFFFFF" />
            </View>
          </LinearGradient>

          {/* Bottom Section: 4-Stage Horizontal Status Cards */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 4 }}>
            {[
              { label: 'Antre', icon: 'time', count: antrianCount, statusKey: 'antrian', color: '#F59E0B', bg: '#FEF3C7', border: '#FCD34D' },
              { label: 'Cuci', icon: 'water', count: dicuciCount, statusKey: 'dicuci', color: '#0EA5E9', bg: '#E0F2FE', border: '#7DD3FC' },
              { label: 'Setrika', icon: 'shirt', count: disetrikaCount, statusKey: 'disetrika', color: '#8B5CF6', bg: '#F3E8FF', border: '#C084FC' },
              { label: 'Siap', icon: 'cube', count: siapCount, statusKey: 'siap diambil', color: '#10B981', bg: '#D1FAE5', border: '#6EE7B7' },
            ].map((stage) => {
              const isSelected = selectedStatus === stage.statusKey;
              const hasCount = stage.count > 0;
              
              const cardStyle: any = [
                { 
                  flex: 1, 
                  borderRadius: 14, 
                  alignItems: 'center', 
                  paddingVertical: 10,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  ...getSoftShadow(true)
                },
                hasCount && {
                  backgroundColor: stage.bg,
                  borderColor: stage.border,
                },
                isSelected && { 
                  borderColor: stage.color, 
                  borderWidth: 2,
                  backgroundColor: stage.bg
                },
                !isSelected && !hasCount && {
                  opacity: 0.5,
                  shadowOpacity: 0,
                  elevation: 0,
                }
              ];

              const textColor = isSelected ? stage.color : hasCount ? stage.color : '#94A3B8';
              const iconColor = isSelected ? stage.color : hasCount ? stage.color : '#CBD5E1';
              const countColor = isSelected ? stage.color : hasCount ? '#1E293B' : '#94A3B8';

              return (
                <TouchableOpacity 
                  key={stage.label}
                  activeOpacity={0.7}
                  onPress={() => setSelectedStatus(isSelected ? null : stage.statusKey)}
                  style={cardStyle}
                >
                  <Text style={{ fontSize: 8, fontFamily: 'PlusJakartaSans-Bold', color: textColor, textTransform: 'uppercase' }}>
                    {stage.label}
                  </Text>
                  <Ionicons 
                    name={stage.icon as any} 
                    size={16} 
                    color={iconColor} 
                    style={{ marginVertical: 6 }} 
                  />
                  <Text style={{ fontSize: 12, fontFamily: 'PlusJakartaSans-Bold', color: countColor }}>
                    {stage.count}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Text style={{ fontSize: 18, fontFamily: 'PlusJakartaSans-Bold', color: '#1E293B', marginLeft: 24, marginTop: 20, marginBottom: 5 }}>Cucian Saya</Text>

        {/* Search Bar (Clean Input) */}
        <View style={{ paddingHorizontal: 24, marginTop: 15, marginBottom: 15 }}>
          <View style={{ 
            borderRadius: 12, 
            backgroundColor: '#FFFFFF', 
            height: 48, 
            flexDirection: 'row', 
            alignItems: 'center', 
            paddingHorizontal: 14,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            ...getSoftShadow(true)
          }}>
            <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={{ flex: 1, fontSize: 13, fontFamily: 'PlusJakartaSans-Medium', color: '#334155', padding: 0 }}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Cari ID LND, status, atau pembayaran..."
              placeholderTextColor="#A0AEC0"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Transactions List */}
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((item) => (
            <LaundryCard 
              key={item.id.toString()} 
              transaction={item} 
              onPress={() => router.push(`/detail/${item.id}`)} 
            />
          ))
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 50, paddingHorizontal: 24 }}>
            <Ionicons name="search-outline" size={40} color="#CCC" />
            <Text style={{ fontSize: 14, color: '#999', fontFamily: 'PlusJakartaSans-Medium', marginTop: 8, textAlign: 'center' }}>
              Tidak ditemukan data cucian.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}



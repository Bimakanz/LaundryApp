import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { COLORS, getSoftShadow } from '../../src/constants/colors';
import { getMyNotifications, markNotificationsAsRead, markSingleNotificationAsRead } from '../../src/api/notifications';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      fetchData();
      return () => markAllRead();
    }, [])
  );

  const fetchData = async () => {
    try {
      const res = await getMyNotifications() as any;
      if (res.success) setNotifications(res.data || []);
    } catch (err) { console.log(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const markAllRead = async () => {
    try { await markNotificationsAsRead(); } catch (err) { console.log(err); }
  };

  const handlePressNotification = async (item: any) => {
    if (!item.is_read) {
      setNotifications((prev: any[]) =>
        prev.map((noti) => (noti.id === item.id ? { ...noti, is_read: true } : noti))
      );
      try {
        await markSingleNotificationAsRead(item.id);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const renderItem = ({ item }: any) => (
    <View style={{ 
      marginHorizontal: 24, 
      marginVertical: 6, 
      borderRadius: 16, 
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      ...getSoftShadow(true)
    }}>
      <TouchableOpacity 
        style={{ padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}
        onPress={() => handlePressNotification(item)}
        activeOpacity={0.7}
      >
        <View style={[{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, { backgroundColor: item.is_read ? '#F1F5F9' : '#D1FAE5' }]}>
          <Ionicons 
            name={item.is_read ? "mail-open-outline" : "mail-unread"} 
            size={20} 
            color={item.is_read ? "#94A3B8" : "#10B981"} 
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans-Bold', color: '#1E293B' }}>{item.title}</Text>
          <Text style={{ fontSize: 12, fontFamily: 'PlusJakartaSans-Regular', color: '#64748B', marginTop: 4, lineHeight: 18 }}>{item.message}</Text>
          <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 8, fontFamily: 'PlusJakartaSans-Medium' }}>{new Date(item.created_at).toLocaleString('id-ID')}</Text>
        </View>
        {!item.is_read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginTop: 6 }} />}
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Header Section */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 24, 
        paddingTop: insets.top + 16, 
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        ...getSoftShadow(true)
      }}>
        <TouchableOpacity 
          activeOpacity={0.7}
          style={{ 
            width: 44, 
            height: 44, 
            borderRadius: 12, 
            backgroundColor: '#FFFFFF', 
            borderWidth: 1,
            borderColor: '#E2E8F0',
            alignItems: 'center', 
            justifyContent: 'center',
            ...getSoftShadow(true)
          }}
          onPress={() => router.replace('/')}
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontFamily: 'PlusJakartaSans-Bold', color: '#1E293B' }}>Notifikasi</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={[{ paddingTop: 16 }, { paddingBottom: 64 + insets.bottom + 16 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 100 }}>
            <Ionicons name="notifications-off-outline" size={48} color="#CCC" />
            <Text style={{ fontSize: 14, color: '#999', fontFamily: 'PlusJakartaSans-Medium', marginTop: 12 }}>Tidak ada notifikasi</Text>
          </View>
        }
      />
    </View>
  );
}


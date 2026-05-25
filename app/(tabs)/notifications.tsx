import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { COLORS, getSoftShadow } from '../../src/constants/colors';
import { getMyNotifications, markNotificationsAsRead, markSingleNotificationAsRead } from '../../src/api/notifications';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      fetchData();
      return () => markAllRead();
    }, [])
  );

  const fetchData = async () => {
    try {
      const res = await getMyNotifications();
      if (res.success) setNotifications(res.data || []);
    } catch (err) { console.log(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const markAllRead = async () => {
    try { await markNotificationsAsRead(); } catch (err) { console.log(err); }
  };

  const handlePressNotification = async (item) => {
    if (!item.is_read) {
      setNotifications((prev) =>
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

  const renderItem = ({ item }) => (
    <View style={[styles.notiOuter, getSoftShadow(true)]}>
      <TouchableOpacity 
        style={[styles.notiInner, getSoftShadow(false)]}
        onPress={() => handlePressNotification(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notiContent}>
          <View style={[styles.iconBox, { backgroundColor: item.is_read ? '#E2E8F0' : '#D1FAE5' }]}>
            <Ionicons 
              name={item.is_read ? "mail-open-outline" : "mail-unread"} 
              size={20} 
              color={item.is_read ? "#94A3B8" : "#10B981"} 
            />
          </View>
          <View style={styles.textContent}>
            <Text style={styles.notiTitle}>{item.title}</Text>
            <Text style={styles.notiMsg}>{item.message}</Text>
            <Text style={styles.notiTime}>{new Date(item.created_at).toLocaleString('id-ID')}</Text>
          </View>
          {!item.is_read && <View style={styles.unreadDot} />}
        </View>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={[styles.headerOuter, getSoftShadow(true)]}>
          <View style={[styles.headerInner, getSoftShadow(false)]}>
            <View style={styles.headerContent}>
              <Text style={styles.pageTitle}>Notifikasi</Text>
            </View>
          </View>
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="notifications-off-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>Tidak ada notifikasi</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 24, paddingBottom: 10 },
  headerOuter: { borderRadius: 30, backgroundColor: COLORS.bg },
  headerInner: { borderRadius: 30, backgroundColor: COLORS.bg },
  headerContent: { padding: 24 },
  pageTitle: { fontSize: 24, fontFamily: 'Poppins-Bold', color: COLORS.primary },
  listContent: { paddingBottom: 120, paddingTop: 10 },
  notiOuter: { marginHorizontal: 24, marginVertical: 12, borderRadius: 24, backgroundColor: COLORS.bg },
  notiInner: { borderRadius: 24, backgroundColor: COLORS.bg },
  notiContent: { padding: 20, flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  textContent: { flex: 1 },
  notiTitle: { fontSize: 15, fontFamily: 'Poppins-Bold', color: '#555' },
  notiMsg: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#777', marginTop: 4, lineHeight: 18 },
  notiTime: { fontSize: 10, color: '#AAA', marginTop: 8, fontFamily: 'Poppins-Medium' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginTop: 6 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { fontSize: 14, color: '#999', fontFamily: 'Poppins-Medium', marginTop: 12 },
});

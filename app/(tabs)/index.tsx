import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, getSoftShadow } from '../../src/constants/colors';
import { getMyLaundry } from '../../src/api/transactions';
import LaundryCard from '../../src/components/LaundryCard';
import { useToast } from '../../src/context/ToastContext';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

const GradientText = ({ children, style, ...props }) => {
  const flatStyle = StyleSheet.flatten(style) || {};
  const {
    fontSize = 24,
    fontFamily = 'Poppins-Bold',
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
            backgroundImage: 'linear-gradient(to right, #59C1BD, #2DD4BF)',
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
          colors={['#59C1BD', '#2DD4BF']} // Gradasi Tosca (Teal ke Cyan)
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
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();

  // Reload data (User & Transactions) whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      loadUser();
      fetchData();
    }, [])
  );

  const loadUser = async () => {
    try { const u = await AsyncStorage.getItem('bilas_user'); if (u) setUser(JSON.parse(u)); } catch {}
  };

  const fetchData = async () => {
    try {
      const res = await getMyLaundry();
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

  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, []);

  const totalCucian = transactions.length;
  const aktif = transactions.filter(t => t.status !== 'diambil').length;
  const diambil = transactions.filter(t => t.status === 'diambil').length;

  const renderHeader = () => (
    <View style={styles.headerWrapper}>
      <View style={[styles.headerOuterWrapper, { paddingTop: insets.top + 20 }]}>
        <View style={[styles.headerOuter, getSoftShadow(true)]}>
          <View style={[styles.headerInner, getSoftShadow(false)]}>
            <View style={styles.headerContent}>
              <Text style={styles.greeting}>Selamat datang,</Text>
              <GradientText style={styles.userName}>{user?.name || 'Pelanggan'}</GradientText>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.softCardOuter, getSoftShadow(true)]}>
          <View style={[styles.softCardInner, getSoftShadow(false)]}>
            <View style={styles.softCardContent}>
              <Text style={styles.summaryValue}>{totalCucian}</Text>
              <Text style={styles.summaryLabel}>TOTAL</Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.softCardOuter, getSoftShadow(true)]}>
          <View style={[styles.softCardInner, getSoftShadow(false)]}>
            <View style={styles.softCardContent}>
              <Text style={styles.summaryValue}>{aktif}</Text>
              <Text style={styles.summaryLabel}>PROSES</Text>
            </View>
          </View>
        </View>

        <View style={[styles.softCardOuter, getSoftShadow(true)]}>
          <View style={[styles.softCardInner, getSoftShadow(false)]}>
            <View style={styles.softCardContent}>
              <Text style={styles.summaryValue}>{diambil}</Text>
              <Text style={styles.summaryLabel}>AMBIL</Text>
            </View>
          </View>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Cucian Saya</Text>
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
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={[styles.headerWrapper, { paddingTop: insets.top + 20 }]}>
          <View style={[styles.headerOuter, getSoftShadow(true)]}>
            <View style={[styles.headerInner, getSoftShadow(false)]}>
              <View style={styles.headerContent}>
                <Text style={styles.greeting}>Selamat datang,</Text>
                <GradientText style={styles.userName}>{user?.name || 'Pelanggan'}</GradientText>
              </View>
            </View>
          </View>
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryRow}>
          <View style={[styles.softCardOuter, getSoftShadow(true)]}>
            <View style={[styles.softCardInner, getSoftShadow(false)]}>
              <View style={styles.softCardContent}>
                <Text style={styles.summaryValue}>{totalCucian}</Text>
                <Text style={styles.summaryLabel}>TOTAL</Text>
              </View>
            </View>
          </View>
          
          <View style={[styles.softCardOuter, getSoftShadow(true)]}>
            <View style={[styles.softCardInner, getSoftShadow(false)]}>
              <View style={styles.softCardContent}>
                <Text style={styles.summaryValue}>{aktif}</Text>
                <Text style={styles.summaryLabel}>PROSES</Text>
              </View>
            </View>
          </View>

          <View style={[styles.softCardOuter, getSoftShadow(true)]}>
            <View style={[styles.softCardInner, getSoftShadow(false)]}>
              <View style={styles.softCardContent}>
                <Text style={styles.summaryValue}>{diambil}</Text>
                <Text style={styles.summaryLabel}>AMBIL</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Cucian Saya</Text>

        {/* Transactions List */}
        {transactions.length > 0 ? (
          transactions.map((item) => (
            <LaundryCard 
              key={item.id.toString()} 
              transaction={item} 
              onPress={() => router.push(`/detail/${item.id}`)} 
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Belum ada data cucian.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { paddingBottom: 120 },
  headerWrapper: { paddingHorizontal: 24, marginBottom: 10 },
  headerOuter: { borderRadius: 30, backgroundColor: COLORS.bg },
  headerInner: { borderRadius: 30, backgroundColor: COLORS.bg },
  headerContent: { padding: 24 },
  greeting: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#999' },
  userName: { fontSize: 24, fontFamily: 'Poppins-Bold', color: COLORS.primary, marginTop: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, marginVertical: 20, gap: 12 },
  softCardOuter: { flex: 1, borderRadius: 24, backgroundColor: COLORS.bg },
  softCardInner: { borderRadius: 24, backgroundColor: COLORS.bg },
  softCardContent: { padding: 16, alignItems: 'center', justifyContent: 'center' },
  summaryValue: { fontSize: 22, fontFamily: 'Poppins-Bold', color: '#555' },
  summaryLabel: { fontSize: 10, fontFamily: 'Poppins-Bold', color: '#AAA', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#444', marginLeft: 24, marginTop: 10, marginBottom: 5 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { fontSize: 14, color: '#999', fontFamily: 'Poppins-Medium' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

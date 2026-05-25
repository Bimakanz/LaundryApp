import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, getSoftShadow } from '../../src/constants/colors';
import client from '../../src/api/client';
import { getTransactionDetail, uploadPaymentProof } from '../../src/api/transactions';
import StatusBar from '../../src/components/StatusBar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useToast } from '../../src/context/ToastContext';
import { API_BASE_URL, API_URL } from '../../src/constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchDetail(); }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await getTransactionDetail(id);
      if (res.success) setData(res.data);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      handleUpload(result.assets[0]);
    }
  };
  const handleUpload = async (asset) => {
    setUploading(true);
    const formData = new FormData();
    try {
      if (Platform.OS === 'web') {
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        formData.append('payment_proof', blob, asset.fileName || `proof_${id}.jpg`);
      } else {
        const uriParts = asset.uri.split('.');
        const fileExt = uriParts[uriParts.length - 1].toLowerCase();
        const cleanExt = ['jpg', 'jpeg', 'png'].includes(fileExt) ? fileExt : 'jpg';
        const mimeType = `image/${cleanExt}`;

        // Gunakan URI asli langsung dari Expo Image Picker tanpa decode, karena native side membutuhkan format aslinya
        formData.append('payment_proof', {
          uri: asset.uri,
          name: asset.fileName || `proof_${id}.${cleanExt}`,
          type: mimeType,
        } as any);
      }

      console.log('Uploading via XHR to:', `${API_URL}/transactions/${id}/payment-proof`);
      
      const token = await AsyncStorage.getItem('bilas_token');
      
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/transactions/${id}/payment-proof`);
      
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      
      xhr.onload = () => {
        try {
          const res = JSON.parse(xhr.responseText);
          if (xhr.status === 200 && res.success) {
            showToast('Bukti transfer berhasil diunggah!');
            fetchDetail();
          } else {
            const validationError = res.errors?.payment_proof?.[0];
            showToast(validationError || res.message || 'Gagal mengunggah bukti.', 'error');
          }
        } catch (e) {
          showToast('Respon server tidak valid.', 'error');
        }
        setUploading(false);
      };
      
      xhr.onerror = () => {
        showToast('Koneksi bermasalah saat mengunggah.', 'error');
        setUploading(false);
      };
      
      xhr.send(formData);
    } catch (err) {
      console.error('XHR Prep Error:', err);
      showToast('Gagal menyiapkan pengunggahan.', 'error');
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      </View>
    );
  }

  const paid = data?.payment_status === 'paid';
  const proofUrl = data?.payment_proof ? `${API_BASE_URL.replace('/api', '')}/storage/${data.payment_proof}` : null;
  const conditionPhotoUrl = data?.condition_photo ? `${API_BASE_URL.replace('/api', '')}/storage/${data.condition_photo}` : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity style={[styles.backBtnOuter, getSoftShadow(true)]} onPress={() => router.back()}>
          <View style={[styles.backBtnInner, getSoftShadow(false)]}>
            <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Cucian</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Info Card */}
        <View style={[styles.cardOuter, getSoftShadow(true)]}>
          <View style={[styles.cardInner, getSoftShadow(false)]}>
            <View style={styles.cardContent}>
              <View style={styles.row}>
                <Text style={styles.invoice}>{data?.invoice_code}</Text>
                <View style={[styles.statusBadge, { backgroundColor: paid ? '#D1FAE5' : '#FEF3C7' }]}>
                  <Text style={[styles.statusText, { color: paid ? '#065F46' : '#92400E' }]}>
                    {paid ? 'LUNAS' : 'PENDING'}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={18} color="#999" />
                <View>
                  <Text style={styles.label}>Tanggal Masuk</Text>
                  <Text style={styles.value}>
                    {data?.created_at ? new Date(data.created_at.replace(' ', 'T')).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }) : '-'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Tracking Card */}
        <View style={[styles.cardOuter, getSoftShadow(true)]}>
          <View style={[styles.cardInner, getSoftShadow(false)]}>
            <View style={styles.cardContent}>
              <Text style={styles.sectionTitle}>STATUS PELACAKAN</Text>
              <StatusBar currentStatus={data?.status} />
              <View style={styles.statusInfoBox}>
                 <Text style={styles.statusMain}>{(data?.status || 'antrian').toUpperCase()}</Text>
                 <Text style={styles.statusSub}>Pesanan Anda sedang diproses</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Proof Card - Only show if not paid */}
        {!paid && (
          <View style={[styles.cardOuter, getSoftShadow(true)]}>
            <View style={[styles.cardInner, getSoftShadow(false)]}>
              <View style={styles.cardContent}>
                <Text style={styles.sectionTitle}>BUKTI TRANSFER</Text>
                {proofUrl ? (
                  <View style={styles.proofContainer}>
                    <Image source={{ uri: proofUrl }} style={styles.proofImage} resizeMode="cover" />
                    <TouchableOpacity style={styles.changeBtn} onPress={pickImage} disabled={uploading}>
                      <Text style={styles.changeBtnText}>{uploading ? 'Mengunggah...' : 'Ganti Gambar'}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.uploadArea} onPress={pickImage} disabled={uploading}>
                    {uploading ? (
                      <ActivityIndicator color={COLORS.primary} />
                    ) : (
                      <>
                        <Ionicons name="cloud-upload-outline" size={40} color={COLORS.primary} />
                        <Text style={styles.uploadText}>Ketuk untuk Unggah Bukti</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Foto Kondisi Baju Card */}
        <View style={[styles.cardOuter, getSoftShadow(true)]}>
          <View style={[styles.cardInner, getSoftShadow(false)]}>
            <View style={styles.cardContent}>
              <Text style={styles.sectionTitle}>FOTO KONDISI BAJU</Text>
              {conditionPhotoUrl ? (
                <View style={styles.photoContainer}>
                  <Image source={{ uri: conditionPhotoUrl }} style={styles.conditionImage} resizeMode="cover" />
                  <View style={styles.infoAlert}>
                     <Ionicons name="information-circle-outline" size={16} color="#59C1BD" style={{ marginTop: 2 }} />
                     <Text style={styles.infoAlertText}>
                       Foto di atas diambil oleh admin untuk memverifikasi kondisi pakaian Anda saat masuk ke LUSTRA.
                     </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyPhotoContainer}>
                  <Ionicons name="image-outline" size={48} color="#CBD5E1" />
                  <Text style={styles.emptyPhotoText}>Belum ada foto pakaian dari admin</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Items Card */}
        <View style={[styles.cardOuter, getSoftShadow(true)]}>
          <View style={[styles.cardInner, getSoftShadow(false)]}>
            <View style={styles.cardContent}>
              <Text style={styles.sectionTitle}>RINCIAN LAYANAN</Text>
              <View style={styles.itemRow}>
                 <View style={styles.itemIcon}><Ionicons name="shirt" size={20} color={COLORS.primary} /></View>
                 <View style={{ flex: 1 }}>
                   <Text style={styles.itemName}>{data?.service?.service_name}</Text>
                   <Text style={styles.itemSub}>{Number(data?.quantity || 0)} {data?.service?.unit} x Rp {Number(data?.service?.price || 0).toLocaleString('id-ID')}</Text>
                 </View>
                 <Text style={styles.itemPrice}>Rp {Number(data?.total_price || 0).toLocaleString('id-ID')}</Text>
              </View>
              <View style={styles.totalRow}>
                 <Text style={styles.totalLabel}>Total Bayar</Text>
                 <Text style={styles.totalValue}>Rp {Number(data?.total_price || 0).toLocaleString('id-ID')}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 15 },
  backBtnOuter: { borderRadius: 15, backgroundColor: COLORS.bg },
  backBtnInner: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#444' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 60 },
  cardOuter: { marginTop: 24, borderRadius: 28, backgroundColor: COLORS.bg },
  cardInner: { borderRadius: 28, backgroundColor: COLORS.bg },
  cardContent: { padding: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  invoice: { fontSize: 22, fontFamily: 'Poppins-Bold', color: COLORS.primary },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 11, fontFamily: 'Poppins-Bold' },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginVertical: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  label: { fontSize: 11, color: '#AAA', fontFamily: 'Poppins-Bold', textTransform: 'uppercase' },
  value: { fontSize: 14, color: '#555', fontFamily: 'Poppins-SemiBold', marginTop: 2 },
  sectionTitle: { fontSize: 11, fontFamily: 'Poppins-Bold', color: '#AAA', letterSpacing: 1, marginBottom: 20 },
  statusInfoBox: { marginTop: 20, alignItems: 'center', padding: 15, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 20 },
  statusMain: { fontSize: 18, fontFamily: 'Poppins-ExtraBold', color: COLORS.primary },
  statusSub: { fontSize: 12, color: '#999', fontFamily: 'Poppins-Medium', marginTop: 4 },
  proofContainer: { alignItems: 'center' },
  proofImage: { width: '100%', height: 200, borderRadius: 20, backgroundColor: '#EEE' },
  changeBtn: { marginTop: 12, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#E2E8F0', borderRadius: 10 },
  changeBtnText: { fontSize: 12, fontFamily: 'Poppins-Bold', color: '#666' },
  uploadArea: { 
    height: 150, borderRadius: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: '#CCC', 
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.3)' 
  },
  uploadText: { marginTop: 8, fontSize: 13, fontFamily: 'Poppins-Medium', color: '#999' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 10 },
  itemIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: 15, fontFamily: 'Poppins-Bold', color: '#555' },
  itemSub: { fontSize: 12, color: '#999', fontFamily: 'Poppins-Medium' },
  itemPrice: { fontSize: 15, fontFamily: 'Poppins-Bold', color: '#555' },
  totalRow: { marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#444' },
  totalValue: { fontSize: 20, fontFamily: 'Poppins-ExtraBold', color: COLORS.primary },
  
  photoContainer: { alignItems: 'center' },
  conditionImage: { width: '100%', height: 220, borderRadius: 20, backgroundColor: '#EEE' },
  infoAlert: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
    borderWidth: 1,
    padding: 12,
    borderRadius: 15,
    marginTop: 15,
  },
  infoAlertText: {
    flex: 1,
    fontSize: 11,
    color: '#1D4ED8',
    fontFamily: 'Poppins-Medium',
    lineHeight: 16,
  },
  emptyPhotoContainer: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  emptyPhotoText: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'Poppins-Bold',
    marginTop: 10,
  },
});

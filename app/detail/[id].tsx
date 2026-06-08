import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTransactionDetail } from '../../src/api/transactions';
import { COLORS, getSoftShadow } from '../../src/constants/colors';
import { API_BASE_URL, API_URL } from '../../src/constants/config';
import { useToast } from '../../src/context/ToastContext';

export default function DetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showGarmentModal, setShowGarmentModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await getTransactionDetail(id) as any;
      if (res.success) setData(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
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

  const handleUpload = async (asset: any) => {
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

  const copyToClipboard = async (text: string) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
    showToast('ID Transaksi berhasil disalin!', 'success');
  };

  const paid = data?.payment_status === 'paid';
  const proofUrl = data?.payment_proof ? `${API_BASE_URL.replace('/api', '')}/storage/${data.payment_proof}` : null;
  const conditionPhotoUrl = data?.condition_photo ? `${API_BASE_URL.replace('/api', '')}/storage/${data.condition_photo}` : null;

  // Format date and time from raw created_at string
  const formatDateTime = (rawDateStr: string) => {
    if (!rawDateStr) return { date: '-', time: '-' };
    try {
      const cleanStr = rawDateStr.replace(' ', 'T');
      const d = new Date(cleanStr);
      const date = d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const time = `${hours}:${minutes}`;
      return { date, time };
    } catch {
      return { date: '-', time: '-' };
    }
  };

  const { date, time } = formatDateTime(data?.created_at);

  // Status mapping to label, color, and icons
  const getStatusDetail = (status: string) => {
    switch (status) {
      case 'diambil':
        return { label: 'Selesai', color: '#16A34A', bg: '#D1FAE5', icon: 'checkmark-circle' };
      case 'siap diambil':
        return { label: 'Siap Diambil', color: '#059669', bg: '#D1FAE5', icon: 'cube-outline' };
      case 'disetrika':
        return { label: 'Sedang Disetrika', color: '#7C3AED', bg: '#F3E8FF', icon: 'shirt-outline' };
      case 'dicuci':
        return { label: 'Sedang Dicuci', color: '#2563EB', bg: '#DBEAFE', icon: 'water-outline' };
      case 'antrian':
      default:
        return { label: 'Dalam Antrian', color: '#D97706', bg: '#FEF3C7', icon: 'time-outline' };
    }
  };

  const statusDetail = getStatusDetail(data?.status || 'antrian');

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header (Non-fixed, transparent) */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16
        }}>
          <TouchableOpacity
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontFamily: 'PlusJakartaSans-Bold', color: '#1E293B' }}>Detail Transaksi</Text>
          <View style={{ width: 44 }} />
        </View>
        {/* GoPay Style Receipt Card */}
        <View style={{
          borderRadius: 24,
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#E2E8F0',
          padding: 24,
          alignItems: 'center',
          ...getSoftShadow(true),
          position: 'relative'
        }}>
          {/* Top Circular Badge */}
          <View style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: '#E0F2FE',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            borderWidth: 4,
            borderColor: '#F0F9FF'
          }}>
            <Ionicons name="receipt" size={28} color="#0284C7" />
          </View>

          {/* Amount (Highlight Green) */}
          <Text style={{
            fontSize: 26,
            fontFamily: 'PlusJakartaSans-ExtraBold',
            color: '#16A34A',
            textAlign: 'center'
          }}>
            Rp {Number(data?.total_price || 0).toLocaleString('id-ID')}
          </Text>

          {/* Subtitle */}
          <Text style={{
            fontSize: 14,
            fontFamily: 'PlusJakartaSans-Bold',
            color: '#64748B',
            marginTop: 4,
            textAlign: 'center'
          }}>
            {data?.service?.service_name || 'Layanan Laundry'}
          </Text>

          {/* Dashed Line */}
          <View style={{
            width: '100%',
            height: 1,
            borderStyle: 'dashed',
            borderWidth: 1,
            borderColor: '#CBD5E1',
            marginVertical: 24
          }} />

          {/* Transaction details block */}
          <View style={{ width: '100%' }}>
            <Text style={{
              fontSize: 15,
              fontFamily: 'PlusJakartaSans-Bold',
              color: '#1E293B',
              marginBottom: 16
            }}>
              Rincian transaksi
            </Text>

            {/* Row: Status */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.detailValue, { color: statusDetail.color, fontFamily: 'PlusJakartaSans-Bold' }]}>
                  {statusDetail.label}
                </Text>
                <Ionicons name={statusDetail.icon as any} size={16} color={statusDetail.color} />
              </View>
            </View>

            {/* Row: Status Pembayaran */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pembayaran</Text>
              <View style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
                backgroundColor: paid ? '#D1FAE5' : '#FEF3C7'
              }}>
                <Text style={{
                  fontSize: 11,
                  fontFamily: 'PlusJakartaSans-Bold',
                  color: paid ? '#065F46' : '#92400E'
                }}>
                  {paid ? 'Lunas' : 'Belum Lunas'}
                </Text>
              </View>
            </View>

            {/* Row: Waktu */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Waktu</Text>
              <Text style={styles.detailValue}>{time}</Text>
            </View>

            {/* Row: Tanggal */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tanggal</Text>
              <Text style={styles.detailValue}>{date}</Text>
            </View>

            {/* Row: ID Transaksi */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ID Transaksi</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => copyToClipboard(data?.invoice_code)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <Text style={styles.detailValue}>{data?.invoice_code || '-'}</Text>
                <Ionicons name="copy-outline" size={14} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Row: Satuan */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Satuan</Text>
              <Text style={styles.detailValue}>
                {Number(data?.quantity || 0)} {data?.service?.unit || 'kg'}
              </Text>
            </View>

            {/* Row: Harga */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Harga</Text>
              <Text style={styles.detailValue}>
                Rp {Number(data?.service?.price || 0).toLocaleString('id-ID')} / {data?.service?.unit || 'kg'}
              </Text>
            </View>

            {/* Dashed Line */}
            <View style={{
              width: '100%',
              height: 1,
              borderStyle: 'dashed',
              borderWidth: 1,
              borderColor: '#E2E8F0',
              marginVertical: 16
            }} />

            {/* Row: Jumlah */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Jumlah</Text>
              <Text style={styles.detailValue}>Rp {Number(data?.total_price || 0).toLocaleString('id-ID')}</Text>
            </View>

            {/* Row: Total */}
            <View style={[styles.detailRow, { marginTop: 4 }]}>
              <Text style={{ fontSize: 15, fontFamily: 'PlusJakartaSans-Bold', color: '#1E293B' }}>Total</Text>
              <Text style={{ fontSize: 16, fontFamily: 'PlusJakartaSans-ExtraBold', color: '#1E293B' }}>
                Rp {Number(data?.total_price || 0).toLocaleString('id-ID')}
              </Text>
            </View>
          </View>
        </View>

        {/* Garment Photo & Payment Buttons Container */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
          {/* Button: Foto Kondisi Baju */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowGarmentModal(true)}
            style={[styles.actionButton, { flex: 1 }]}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="shirt-outline" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.actionButtonText}>Foto Kondisi</Text>
          </TouchableOpacity>

          {/* Button: Bukti Pembayaran */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowPaymentModal(true)}
            style={[styles.actionButton, { flex: 1 }]}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="card-outline" size={20} color="#22C55E" />
            </View>
            <Text style={styles.actionButtonText}>Bukti Bayar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal: Foto Kondisi Baju */}
      <Modal
        visible={showGarmentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGarmentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Foto Kondisi Baju</Text>
              <TouchableOpacity onPress={() => setShowGarmentModal(false)}>
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }}>
              {conditionPhotoUrl ? (
                <>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setFullScreenImage(conditionPhotoUrl)}
                    style={{ width: '100%' }}
                  >
                    <Image
                      source={{ uri: conditionPhotoUrl }}
                      style={{ width: '100%', height: 260, borderRadius: 16, backgroundColor: '#F1F5F9' }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <View style={{ flexDirection: 'row', gap: 8, backgroundColor: '#EFF6FF', borderColor: '#DBEAFE', borderWidth: 1, padding: 12, borderRadius: 12, marginTop: 16 }}>
                    <Ionicons name="information-circle-outline" size={18} color="#3B82F6" style={{ marginTop: 2 }} />
                    <Text style={{ flex: 1, fontSize: 12, color: '#1E40AF', fontFamily: 'PlusJakartaSans-Medium', lineHeight: 18 }}>
                      Foto di atas diambil oleh admin untuk memverifikasi kondisi pakaian Anda saat masuk ke LUSTRA.
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.emptyModalView}>
                  <Ionicons name="image-outline" size={48} color="#CBD5E1" />
                  <Text style={styles.emptyModalText}>Belum ada foto pakaian dari admin</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal: Bukti Pembayaran */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bukti Pembayaran</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView contentContainerStyle={{ padding: 24 }}>
              {proofUrl ? (
                <View style={{ alignItems: 'center' }}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setFullScreenImage(proofUrl)}
                    style={{ width: '100%' }}
                  >
                    <Image
                      source={{ uri: proofUrl }}
                      style={{ width: '100%', height: 260, borderRadius: 16, backgroundColor: '#F1F5F9' }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  {!paid && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.uploadButton, { marginTop: 16 }]}
                      onPress={pickImage}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                          <Text style={styles.uploadButtonText}>Ganti Bukti</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.dashedUploadBox}
                    onPress={pickImage}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <ActivityIndicator color={COLORS.primary} />
                    ) : (
                      <>
                        <Ionicons name="cloud-upload-outline" size={40} color={COLORS.primary} />
                        <Text style={{ marginTop: 8, fontSize: 13, fontFamily: 'PlusJakartaSans-Bold', color: COLORS.primary }}>
                          Unggah Bukti Transfer
                        </Text>
                        <Text style={{ marginTop: 4, fontSize: 11, fontFamily: 'PlusJakartaSans-Medium', color: '#94A3B8', textAlign: 'center' }}>
                          Ketuk untuk mengambil dari galeri
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Full Screen Image Viewer Modal */}
      <Modal
        visible={!!fullScreenImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullScreenImage(null)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.fullScreenOverlay}
          onPress={() => setFullScreenImage(null)}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.fullScreenCloseButton}
            onPress={() => setFullScreenImage(null)}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          {fullScreenImage && (
            <Image
              source={{ uri: fullScreenImage }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#64748B'
  },
  detailValue: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#1E293B'
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...getSoftShadow(true)
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#1E293B'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxHeight: '85%',
    ...getSoftShadow(true)
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#1E293B'
  },
  emptyModalView: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  emptyModalText: {
    fontSize: 13,
    color: '#94A3B8',
    fontFamily: 'PlusJakartaSans-Bold',
    marginTop: 12,
    textAlign: 'center'
  },
  dashedUploadBox: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20
  },
  uploadButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: '100%',
    ...getSoftShadow(true)
  },
  uploadButtonText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#FFFFFF'
  },
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center'
  },
  fullScreenImage: {
    width: '100%',
    height: '100%'
  },
  fullScreenCloseButton: {
    position: 'absolute',
    top: 50,
    right: 24,
    zIndex: 9999,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  }
});

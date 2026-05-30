import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTransactionDetail } from '../../src/api/transactions';
import StatusBar from '../../src/components/StatusBar';
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
  const [isPhotoExpanded, setIsPhotoExpanded] = useState(false);
  const [photoRatio, setPhotoRatio] = useState<number | null>(null);

  useEffect(() => { fetchDetail(); }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await getTransactionDetail(id) as any;
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

  const paid = data?.payment_status === 'paid';
  const proofUrl = data?.payment_proof ? `${API_BASE_URL.replace('/api', '')}/storage/${data.payment_proof}` : null;
  const conditionPhotoUrl = data?.condition_photo ? `${API_BASE_URL.replace('/api', '')}/storage/${data.condition_photo}` : null;

  useEffect(() => {
    if (conditionPhotoUrl) {
      Image.getSize(conditionPhotoUrl, (width, height) => {
        if (height > 0) setPhotoRatio(width / height);
      }, () => {
        setPhotoRatio(1);
      });
    }
  }, [conditionPhotoUrl]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      </View>
    );
  }



  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Header */}
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
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontFamily: 'PlusJakartaSans-Bold', color: '#1E293B' }}>Detail Cucian</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        {/* Main Info Card */}
        <View style={{ 
          marginTop: 24, 
          borderRadius: 16, 
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#E2E8F0',
          padding: 24,
          ...getSoftShadow(true)
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontFamily: 'PlusJakartaSans-Bold', color: COLORS.primary }}>{data?.invoice_code}</Text>
            <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: paid ? '#D1FAE5' : '#FEF3C7' }}>
              <Text style={{ fontSize: 11, fontFamily: 'PlusJakartaSans-Bold', color: paid ? '#065F46' : '#92400E' }}>
                {paid ? 'LUNAS' : 'PENDING'}
              </Text>
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: '#E2E8F0', marginVertical: 20 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
            <Ionicons name="calendar-outline" size={18} color="#94A3B8" />
            <View>
              <Text style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase' }}>Tanggal Masuk</Text>
              <Text style={{ fontSize: 14, color: '#334155', fontFamily: 'PlusJakartaSans-SemiBold', marginTop: 2 }}>
                {data?.created_at ? new Date(data.created_at.replace(' ', 'T')).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) : '-'}
              </Text>
            </View>
          </View>
        </View>

        {/* Tracking Card */}
        <View style={{ 
          marginTop: 24, 
          borderRadius: 16, 
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#E2E8F0',
          padding: 24,
          ...getSoftShadow(true)
        }}>
          <Text style={{ fontSize: 11, fontFamily: 'PlusJakartaSans-Bold', color: '#94A3B8', letterSpacing: 1, marginBottom: 20 }}>STATUS PELACAKAN</Text>
          <StatusBar currentStatus={data?.status} />
          <View style={{ marginTop: 20, alignItems: 'center', padding: 15, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16 }}>
            <Text style={{ fontSize: 18, fontFamily: 'PlusJakartaSans-ExtraBold', color: COLORS.primary }}>{(data?.status || 'antrian').toUpperCase()}</Text>
            <Text style={{ fontSize: 12, color: '#64748B', fontFamily: 'PlusJakartaSans-Medium', marginTop: 4 }}>
              {data?.status === 'siap diambil' 
                ? 'Pesanan Anda sudah siap diambil' 
                : data?.status === 'diambil' 
                  ? 'Pesanan Anda telah diambil' 
                  : 'Pesanan Anda sedang diproses'}
            </Text>
          </View>
        </View>

        {/* Payment Proof Card - Only show if not paid */}
        {!paid && (
          <View style={{ 
            marginTop: 24, 
            borderRadius: 16, 
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E2E8F0',
            padding: 24,
            ...getSoftShadow(true)
          }}>
            <Text style={{ fontSize: 11, fontFamily: 'PlusJakartaSans-Bold', color: '#94A3B8', letterSpacing: 1, marginBottom: 20 }}>BUKTI TRANSFER</Text>
            {proofUrl ? (
              <View style={{ alignItems: 'center' }}>
                <Image source={{ uri: proofUrl }} style={{ width: '100%', height: 200, borderRadius: 16, backgroundColor: '#F1F5F9' }} resizeMode="cover" />
                <TouchableOpacity style={{ marginTop: 12, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10 }} onPress={pickImage} disabled={uploading}>
                  <Text style={{ fontSize: 12, fontFamily: 'PlusJakartaSans-Bold', color: '#64748B' }}>{uploading ? 'Mengunggah...' : 'Ganti Gambar'}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={{ height: 150, borderRadius: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }} onPress={pickImage} disabled={uploading}>
                {uploading ? (
                  <ActivityIndicator color={COLORS.primary} />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={40} color={COLORS.primary} />
                    <Text style={{ marginTop: 8, fontSize: 13, fontFamily: 'PlusJakartaSans-Medium', color: '#94A3B8' }}>Ketuk untuk Unggah Bukti</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Foto Kondisi Baju Card */}
        <View style={{ 
          marginTop: 24, 
          borderRadius: 16, 
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#E2E8F0',
          padding: 24,
          ...getSoftShadow(true)
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 11, fontFamily: 'PlusJakartaSans-Bold', color: '#94A3B8', letterSpacing: 1 }}>FOTO KONDISI BAJU</Text>
            {conditionPhotoUrl && (
              <TouchableOpacity onPress={() => setIsPhotoExpanded(!isPhotoExpanded)} style={{ padding: 4 }}>
                <Ionicons name={isPhotoExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
          {conditionPhotoUrl ? (
            <TouchableOpacity activeOpacity={0.9} onPress={() => setIsPhotoExpanded(!isPhotoExpanded)} style={{ alignItems: 'center' }}>
              <Image 
                source={{ uri: conditionPhotoUrl }} 
                style={[
                  { width: '100%', backgroundColor: '#F1F5F9', borderRadius: 16 },
                  isPhotoExpanded && photoRatio ? { aspectRatio: photoRatio } : { height: 140 }
                ]} 
                resizeMode={isPhotoExpanded ? "contain" : "cover"} 
              />
              <View style={{ flexDirection: 'row', gap: 8, backgroundColor: '#EFF6FF', borderColor: '#DBEAFE', borderWidth: 1, padding: 12, borderRadius: 12, marginTop: 15 }}>
                <Ionicons name="information-circle-outline" size={16} color="#56C3E2" style={{ marginTop: 2 }} />
                <Text style={{ flex: 1, fontSize: 11, color: '#1D4ED8', fontFamily: 'PlusJakartaSans-Medium', lineHeight: 16 }}>
                  Foto di atas diambil oleh admin untuk memverifikasi kondisi pakaian Anda saat masuk ke LUSTRA.
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={{ paddingVertical: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', borderRadius: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: '#E2E8F0' }}>
              <Ionicons name="image-outline" size={48} color="#CBD5E1" />
              <Text style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'PlusJakartaSans-Bold', marginTop: 10 }}>Belum ada foto pakaian dari admin</Text>
            </View>
          )}
        </View>

        {/* Items Card */}
        <View style={{ 
          marginTop: 24, 
          borderRadius: 16, 
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#E2E8F0',
          padding: 24,
          ...getSoftShadow(true)
        }}>
          <Text style={{ fontSize: 11, fontFamily: 'PlusJakartaSans-Bold', color: '#94A3B8', letterSpacing: 1, marginBottom: 20 }}>RINCIAN LAYANAN</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 0 }}>
             <View style={{ flex: 1 }}>
               <Text style={{ fontSize: 16, fontFamily: 'PlusJakartaSans-Bold', color: '#334155' }}>{data?.service?.service_name}</Text>
               <Text style={{ fontSize: 13, color: '#64748B', fontFamily: 'PlusJakartaSans-Medium', marginTop: 2 }}>
                 {Number(data?.quantity || 0)} {data?.service?.unit} x Rp {Number(data?.service?.price || 0).toLocaleString('id-ID')}
               </Text>
             </View>
             <Text style={{ fontSize: 16, fontFamily: 'PlusJakartaSans-Bold', color: '#334155' }}>Rp {Number(data?.total_price || 0).toLocaleString('id-ID')}</Text>
          </View>
          <View style={{ marginTop: 20, paddingTop: 18, borderTopWidth: 1, borderStyle: 'dashed', borderTopColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontFamily: 'PlusJakartaSans-Bold', color: '#334155' }}>Total Bayar</Text>
            <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-ExtraBold', color: COLORS.primary }}>Rp {Number(data?.total_price || 0).toLocaleString('id-ID')}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}


import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { changePassword, getProfile, logout, updateProfile } from '../../src/api/auth';
import { COLORS, getSoftShadow } from '../../src/constants/colors';
import { useAuth } from '../../src/context/AuthContext';
import { useToast } from '../../src/context/ToastContext';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { signOut } = useAuth();
  const router = useRouter();

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const u = await AsyncStorage.getItem('bilas_user');
      if (u) setUser(JSON.parse(u));
      const res = await getProfile() as any;
      if (res.success) {
        const freshUser = res.data;
        setProfile(freshUser);
        setUser(freshUser);
        setPhone(freshUser.customer?.phone || '');
        setAddress(freshUser.customer?.address || '');
        await AsyncStorage.setItem('bilas_user', JSON.stringify(freshUser));
      }
    } catch (err) { console.log('Error:', err); }
    finally { setLoading(false); }
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    try { await logout(); } catch { }
    showToast('Berhasil keluar.');
    await signOut();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateProfile({ phone, address }) as any;
      if (res.success) {
        const updatedUser = res.data;
        setProfile(updatedUser);
        setUser(updatedUser);
        setPhone(updatedUser.customer?.phone || '');
        setAddress(updatedUser.customer?.address || '');
        await AsyncStorage.setItem('bilas_user', JSON.stringify(updatedUser));
        showToast('Profil berhasil disimpan!');
        setIsEditing(false);
      } else {
        showToast(res.message || 'Gagal menyimpan profil.', 'error');
      }
    } catch (err) {
      console.log(err);
      showToast('Terjadi kesalahan saat menyimpan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setPhone(profile?.customer?.phone || '');
    setAddress(profile?.customer?.address || '');
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showToast('Harap isi semua field password.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password baru minimal 6 karakter.', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('Konfirmasi password baru tidak cocok.', 'error');
      return;
    }
    setChangingPassword(true);
    try {
      const res = await changePassword(currentPassword, newPassword) as any;
      if (res.success) {
        showToast('Password berhasil diubah!');
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        showToast(res.message || 'Gagal mengubah password.', 'error');
      }
    } catch (err: any) {
      console.log(err);
      let errMsg = 'Terjadi kesalahan saat mengubah password.';
      if (err.response && err.response.data && err.response.data.message) {
        errMsg = err.response.data.message;
      } else if (err.message) {
        errMsg = err.message;
      }
      showToast(errMsg, 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const getInitials = (name: any) => {
    if (!name) return '?';
    return name.split(' ').map((w: any) => w[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }}>
        {/* Header Section (Non-fixed, transparent) */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          paddingHorizontal: 24, 
          paddingBottom: 16,
        }}>
          <TouchableOpacity 
            activeOpacity={0.7}
            style={{ 
              width: 44, 
              height: 44, 
              borderRadius: 12, 
              alignItems: 'center', 
              justifyContent: 'center'
            }}
            onPress={() => router.replace('/')}
          >
            <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontFamily: 'PlusJakartaSans-Bold', color: '#1E293B' }}>Profil Saya</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* User Card */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
          <View style={{ 
            borderRadius: 16, 
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E2E8F0',
            ...getSoftShadow(true)
          }}>
            {/* User Profile Badge */}
            <View style={{ padding: 32, alignItems: 'center' }}>
              <View style={{ 
                width: 80, 
                height: 80, 
                borderRadius: 40, 
                backgroundColor: '#F1F5F9', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: 16 
              }}>
                <Text style={{ fontSize: 28, fontFamily: 'PlusJakartaSans-Bold', color: COLORS.primary }}>{getInitials(user?.name)}</Text>
              </View>
              <Text style={{ fontSize: 22, fontFamily: 'PlusJakartaSans-Bold', color: '#1E293B' }}>{user?.name || '-'}</Text>
              <Text style={{ fontSize: 13, color: '#94A3B8', marginTop: 4, fontFamily: 'PlusJakartaSans-Medium' }}>{user?.email || '-'}</Text>
            </View>

            {/* Separator Line */}
            <View style={{ height: 1, backgroundColor: '#E2E8F0', marginHorizontal: 24 }} />

            {/* Info Section details */}
            <View style={{ padding: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <Ionicons name="call-outline" size={20} color="#94A3B8" style={{ marginTop: isEditing ? 8 : 0 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>Nomor HP</Text>
                  {isEditing ? (
                    <View style={{ 
                      borderRadius: 12, 
                      backgroundColor: '#F8FAFC', 
                      height: 48, 
                      justifyContent: 'center', 
                      paddingHorizontal: 12,
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
                      marginTop: 6
                    }}>
                      <TextInput
                        style={{ fontSize: 14, fontFamily: 'PlusJakartaSans-Medium', color: '#334155', padding: 0 }}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Masukkan nomor HP..."
                        placeholderTextColor="#CBD5E1"
                        keyboardType="phone-pad"
                      />
                    </View>
                  ) : (
                    <Text style={{ fontSize: 14, color: '#334155', fontFamily: 'PlusJakartaSans-SemiBold', marginTop: 2 }}>{profile?.customer?.phone || '-'}</Text>
                  )}
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 24 }}>
                <Ionicons name="location-outline" size={20} color="#94A3B8" style={{ marginTop: isEditing ? 8 : 0 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>Alamat Pengiriman</Text>
                  {isEditing ? (
                    <View style={{ 
                      borderRadius: 12, 
                      backgroundColor: '#F8FAFC', 
                      height: 80, 
                      paddingHorizontal: 12,
                      paddingTop: 10,
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
                      marginTop: 6
                    }}>
                      <TextInput
                        style={{ fontSize: 14, fontFamily: 'PlusJakartaSans-Medium', color: '#334155', padding: 0, textAlignVertical: 'top', flex: 1, width: '100%' }}
                        value={address}
                        onChangeText={setAddress}
                        placeholder="Masukkan alamat lengkap..."
                        placeholderTextColor="#CBD5E1"
                        multiline
                        numberOfLines={3}
                      />
                    </View>
                  ) : (
                    <Text style={{ fontSize: 14, color: '#334155', fontFamily: 'PlusJakartaSans-SemiBold', marginTop: 2 }}>{profile?.customer?.address || '-'}</Text>
                  )}
                </View>
              </View>

              {/* Edit Actions */}
              <View style={{ marginTop: 32 }}>
                {isEditing ? (
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                      style={{ 
                        flex: 1, 
                        height: 48, 
                        borderRadius: 12, 
                        backgroundColor: '#F1F5F9', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: '#E2E8F0'
                      }}
                      onPress={handleCancel}
                      disabled={saving}
                    >
                      <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans-Bold', color: '#94A3B8' }}>Batal</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ flex: 1.5 }}
                      onPress={handleSave}
                      disabled={saving}
                    >
                      <View style={{ 
                        height: 48, 
                        borderRadius: 12, 
                        backgroundColor: COLORS.primary, 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        ...getSoftShadow(true)
                      }}>
                        {saving ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans-Bold', color: '#FFF' }}>Simpan</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={{ 
                      borderRadius: 12, 
                      backgroundColor: '#FFFFFF',
                      borderWidth: 1,
                      borderColor: COLORS.primary,
                      height: 48,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      ...getSoftShadow(true)
                    }}
                    onPress={() => setIsEditing(true)}
                  >
                    <Ionicons name="create-outline" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans-Bold', color: COLORS.primary }}>EDIT PROFIL</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Security Section */}
        <View style={{ paddingHorizontal: 24, marginTop: 16 }}>
          <View style={{ 
            borderRadius: 16, 
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E2E8F0',
            ...getSoftShadow(true)
          }}>
            <View style={{ padding: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#94A3B8" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>Keamanan</Text>
                  <Text style={{ fontSize: 14, color: '#334155', fontFamily: 'PlusJakartaSans-SemiBold', marginTop: 2 }}>Ubah Password Anda secara berkala</Text>
                </View>
              </View>

              <TouchableOpacity
                style={{ 
                  borderRadius: 12, 
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: COLORS.primary,
                  height: 48,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 20,
                  ...getSoftShadow(true)
                }}
                onPress={() => setShowPasswordModal(true)}
              >
                <Ionicons name="key-outline" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans-Bold', color: COLORS.primary }}>UBAH PASSWORD</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
          <TouchableOpacity
            style={{ 
              borderRadius: 12, 
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: COLORS.danger,
              height: 56,
              alignItems: 'center',
              justifyContent: 'center',
              ...getSoftShadow(true)
            }}
            onPress={() => setShowLogoutModal(true)}
          >
            <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans-Bold', color: COLORS.danger, letterSpacing: 1 }}>KELUAR APLIKASI</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', padding: 24, zIndex: 1000 }}>
          <View style={{ 
            borderRadius: 16, 
            backgroundColor: '#FFFFFF', 
            width: '100%', 
            maxWidth: 340,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            ...getSoftShadow(true)
          }}>
            <View style={{ padding: 32, alignItems: 'center' }}>
              <View style={{ 
                width: 70, 
                height: 70, 
                borderRadius: 35, 
                backgroundColor: '#FEF2F2', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: 20 
              }}>
                <Ionicons name="log-out-outline" size={32} color={COLORS.danger} />
              </View>
              <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: '#1E293B', marginBottom: 8 }}>Keluar dari LUSTRA?</Text>
              <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', fontFamily: 'PlusJakartaSans-Regular', marginBottom: 32, lineHeight: 20 }}>Anda yakin ingin mengakhiri sesi saat ini?</Text>

              <View style={{ flexDirection: 'row', gap: 16, width: '100%' }}>
                <TouchableOpacity
                  style={{ 
                    flex: 1, 
                    height: 48, 
                    borderRadius: 12, 
                    backgroundColor: '#F1F5F9', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#E2E8F0'
                  }}
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans-Bold', color: '#94A3B8' }}>Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ flex: 1.5 }}
                  onPress={handleLogout}
                >
                  <View style={{ 
                    height: 48, 
                    borderRadius: 12, 
                    backgroundColor: COLORS.danger, 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    ...getSoftShadow(true)
                  }}>
                    <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans-Bold', color: '#FFF' }}>Ya, Keluar</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', padding: 24, zIndex: 1000 }}>
          <View style={{ 
            borderRadius: 16, 
            backgroundColor: '#FFFFFF', 
            width: '100%', 
            maxWidth: 360,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            ...getSoftShadow(true)
          }}>
            <View style={{ padding: 32, alignItems: 'center' }}>
              <View style={{ 
                width: 70, 
                height: 70, 
                borderRadius: 35, 
                backgroundColor: '#ECFDF5', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: 20 
              }}>
                <Ionicons name="key-outline" size={32} color={COLORS.primary} />
              </View>
              <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: '#1E293B', marginBottom: 8 }}>Ubah Password</Text>
              <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', fontFamily: 'PlusJakartaSans-Regular', marginBottom: 20, lineHeight: 20 }}>Masukkan password Anda saat ini dan password baru Anda.</Text>

              <View style={{ width: '100%', gap: 12 }}>
                <View style={{ 
                  borderRadius: 12, 
                  backgroundColor: '#F8FAFC', 
                  width: '100%',
                  height: 50, 
                  justifyContent: 'center', 
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: '#E2E8F0'
                }}>
                  <TextInput
                    style={{ fontSize: 13, fontFamily: 'PlusJakartaSans-Medium', color: '#334155', padding: 0 }}
                    placeholder="Password saat ini"
                    placeholderTextColor="#CBD5E1"
                    secureTextEntry
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                  />
                </View>

                <View style={{ 
                  borderRadius: 12, 
                  backgroundColor: '#F8FAFC', 
                  width: '100%',
                  height: 50, 
                  justifyContent: 'center', 
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: '#E2E8F0'
                }}>
                  <TextInput
                    style={{ fontSize: 13, fontFamily: 'PlusJakartaSans-Medium', color: '#334155', padding: 0 }}
                    placeholder="Password baru (min. 6 karakter)"
                    placeholderTextColor="#CBD5E1"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                </View>

                <View style={{ 
                  borderRadius: 12, 
                  backgroundColor: '#F8FAFC', 
                  width: '100%',
                  height: 50, 
                  justifyContent: 'center', 
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: '#E2E8F0'
                }}>
                  <TextInput
                    style={{ fontSize: 13, fontFamily: 'PlusJakartaSans-Medium', color: '#334155', padding: 0 }}
                    placeholder="Konfirmasi password baru"
                    placeholderTextColor="#CBD5E1"
                    secureTextEntry
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 16, width: '100%', marginTop: 28 }}>
                <TouchableOpacity
                  style={{ 
                    flex: 1, 
                    height: 48, 
                    borderRadius: 12, 
                    backgroundColor: '#F1F5F9', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#E2E8F0'
                  }}
                  onPress={() => {
                    setShowPasswordModal(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                  }}
                  disabled={changingPassword}
                >
                  <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans-Bold', color: '#94A3B8' }}>Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ flex: 1.5 }}
                  onPress={handleChangePassword}
                  disabled={changingPassword}
                >
                  <View style={{ 
                    height: 48, 
                    borderRadius: 12, 
                    backgroundColor: COLORS.primary, 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    ...getSoftShadow(true)
                  }}>
                    {changingPassword ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans-Bold', color: '#FFF' }}>Simpan</Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

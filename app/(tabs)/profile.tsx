import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Platform, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, getSoftShadow } from '../../src/constants/colors';
import { getProfile, logout, updateProfile, changePassword } from '../../src/api/auth';
import { useAuth } from '../../src/context/AuthContext';
import { useToast } from '../../src/context/ToastContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
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

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const u = await AsyncStorage.getItem('bilas_user');
      if (u) setUser(JSON.parse(u));
      const res = await getProfile();
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
    try { await logout(); } catch {}
    showToast('Berhasil keluar.');
    await signOut();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateProfile({ phone, address });
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
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        showToast('Password berhasil diubah!');
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        showToast(res.message || 'Gagal mengubah password.', 'error');
      }
    } catch (err) {
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

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header Section */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <View style={[styles.profileCardOuter, getSoftShadow(true)]}>
            <View style={[styles.profileCardInner, getSoftShadow(false)]}>
              <View style={styles.profileContent}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
                </View>
                <Text style={styles.name}>{user?.name || '-'}</Text>
                <Text style={styles.email}>{user?.email || '-'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoWrapper}>
          <View style={[styles.infoCardOuter, getSoftShadow(true)]}>
            <View style={[styles.infoCardInner, getSoftShadow(false)]}>
              <View style={styles.infoContent}>
                <View style={styles.infoItem}>
                  <Ionicons name="call-outline" size={20} color="#999" style={{ marginTop: isEditing ? 8 : 0 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>Nomor HP</Text>
                    {isEditing ? (
                      <View style={[styles.editInputOuter, getSoftShadow(true)]}>
                        <View style={[styles.editInputInner, getSoftShadow(false)]}>
                          <TextInput
                            style={styles.editInput}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Masukkan nomor HP..."
                            placeholderTextColor="#CBD5E1"
                            keyboardType="phone-pad"
                          />
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.infoValue}>{profile?.customer?.phone || '-'}</Text>
                    )}
                  </View>
                </View>
                <View style={[styles.infoItem, { marginTop: 24 }]}>
                  <Ionicons name="location-outline" size={20} color="#999" style={{ marginTop: isEditing ? 8 : 0 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>Alamat Pengiriman</Text>
                    {isEditing ? (
                      <View style={[styles.editInputOuter, getSoftShadow(true)]}>
                        <View style={[styles.editInputInner, getSoftShadow(false), { height: 80, alignItems: 'flex-start', paddingTop: 10 }]}>
                          <TextInput
                            style={[styles.editInput, { textAlignVertical: 'top', flex: 1, width: '100%' }]}
                            value={address}
                            onChangeText={setAddress}
                            placeholder="Masukkan alamat lengkap..."
                            placeholderTextColor="#CBD5E1"
                            multiline
                            numberOfLines={3}
                          />
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.infoValue}>{profile?.customer?.address || '-'}</Text>
                    )}
                  </View>
                </View>

                {/* Edit Actions */}
                <View style={{ marginTop: 32 }}>
                  {isEditing ? (
                    <View style={styles.editActionsRow}>
                      <TouchableOpacity
                        style={[styles.editBtnCancel, getSoftShadow(true)]}
                        onPress={handleCancel}
                        disabled={saving}
                      >
                        <Text style={styles.editBtnCancelText}>Batal</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.editBtnSave}
                        onPress={handleSave}
                        disabled={saving}
                      >
                        <View style={[styles.editBtnSaveInner, getSoftShadow(true)]}>
                          {saving ? (
                            <ActivityIndicator size="small" color="#FFF" />
                          ) : (
                            <Text style={styles.editBtnSaveText}>Simpan</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.editToggleBtnOuter, getSoftShadow(true)]}
                      onPress={() => setIsEditing(true)}
                    >
                      <View style={[styles.editToggleBtnInner, getSoftShadow(false)]}>
                        <Ionicons name="create-outline" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
                        <Text style={styles.editToggleBtnText}>EDIT PROFIL</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Security Section */}
        <View style={[styles.infoWrapper, { marginTop: 20 }]}>
          <View style={[styles.infoCardOuter, getSoftShadow(true)]}>
            <View style={[styles.infoCardInner, getSoftShadow(false)]}>
              <View style={styles.infoContent}>
                <View style={styles.infoItem}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#999" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>Keamanan</Text>
                    <Text style={styles.infoValue}>Ubah Password Anda secara berkala</Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={[styles.editToggleBtnOuter, getSoftShadow(true), { marginTop: 20 }]}
                  onPress={() => setShowPasswordModal(true)}
                >
                  <View style={[styles.editToggleBtnInner, getSoftShadow(false)]}>
                    <Ionicons name="key-outline" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.editToggleBtnText}>UBAH PASSWORD</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutWrapper}>
          <TouchableOpacity 
            style={[styles.logoutBtnOuter, getSoftShadow(true)]} 
            onPress={() => setShowLogoutModal(true)}
          >
            <View style={[styles.logoutBtnInner, getSoftShadow(false)]}>
               <Text style={styles.logoutText}>KELUAR APLIKASI</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalOuter, getSoftShadow(true)]}>
            <View style={[styles.modalInner, getSoftShadow(false)]}>
              <View style={styles.modalContent}>
                <View style={styles.warningIcon}>
                  <Ionicons name="log-out-outline" size={32} color={COLORS.danger} />
                </View>
                <Text style={styles.modalTitle}>Keluar dari LUSTRA?</Text>
                <Text style={styles.modalSub}>Anda yakin ingin mengakhiri sesi saat ini?</Text>
                
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.modalBtnCancel, getSoftShadow(true)]} 
                    onPress={() => setShowLogoutModal(false)}
                  >
                    <Text style={styles.modalBtnCancelText}>Batal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modalBtnConfirm} 
                    onPress={handleLogout}
                  >
                    <View style={[styles.modalBtnConfirmInner, getSoftShadow(true)]}>
                      <Text style={styles.modalBtnConfirmText}>Ya, Keluar</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalOuter, getSoftShadow(true), { maxWidth: 360 }]}>
            <View style={[styles.modalInner, getSoftShadow(false)]}>
              <View style={styles.modalContent}>
                <View style={[styles.warningIcon, { backgroundColor: COLORS.bg, borderColor: 'rgba(255,255,255,0.7)' }]}>
                  <Ionicons name="key-outline" size={32} color={COLORS.primary} />
                </View>
                <Text style={styles.modalTitle}>Ubah Password</Text>
                <Text style={[styles.modalSub, { marginBottom: 20 }]}>Masukkan password Anda saat ini dan password baru Anda.</Text>
                
                <View style={{ width: '100%', gap: 12 }}>
                  <View style={[styles.modalInputOuter, getSoftShadow(true)]}>
                    <View style={[styles.modalInputInner, getSoftShadow(false)]}>
                      <TextInput
                        style={styles.modalTextInput}
                        placeholder="Password saat ini"
                        placeholderTextColor="#CBD5E1"
                        secureTextEntry
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                      />
                    </View>
                  </View>
                  
                  <View style={[styles.modalInputOuter, getSoftShadow(true)]}>
                    <View style={[styles.modalInputInner, getSoftShadow(false)]}>
                      <TextInput
                        style={styles.modalTextInput}
                        placeholder="Password baru (min. 6 karakter)"
                        placeholderTextColor="#CBD5E1"
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                      />
                    </View>
                  </View>
                  
                  <View style={[styles.modalInputOuter, getSoftShadow(true)]}>
                    <View style={[styles.modalInputInner, getSoftShadow(false)]}>
                      <TextInput
                        style={styles.modalTextInput}
                        placeholder="Konfirmasi password baru"
                        placeholderTextColor="#CBD5E1"
                        secureTextEntry
                        value={confirmNewPassword}
                        onChangeText={setConfirmNewPassword}
                      />
                    </View>
                  </View>
                </View>
                
                <View style={[styles.modalActions, { marginTop: 28 }]}>
                  <TouchableOpacity 
                    style={[styles.modalBtnCancel, getSoftShadow(true)]} 
                    onPress={() => {
                      setShowPasswordModal(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmNewPassword('');
                    }}
                    disabled={changingPassword}
                  >
                    <Text style={styles.modalBtnCancelText}>Batal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modalBtnConfirm} 
                    onPress={handleChangePassword}
                    disabled={changingPassword}
                  >
                    <View style={[styles.modalBtnConfirmInner, getSoftShadow(true), { backgroundColor: COLORS.primary }]}>
                      {changingPassword ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Text style={styles.modalBtnConfirmText}>Simpan</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 24, paddingBottom: 10 },
  profileCardOuter: { borderRadius: 32, backgroundColor: COLORS.bg },
  profileCardInner: { borderRadius: 32, backgroundColor: COLORS.bg },
  profileContent: { padding: 32, alignItems: 'center' },
  avatar: { 
    width: 80, height: 80, borderRadius: 30, backgroundColor: '#FFFFFF', 
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    ...Platform.select({ web: { boxShadow: '4px 4px 10px rgba(0,0,0,0.05)' } })
  },
  avatarText: { fontSize: 28, fontFamily: 'Poppins-Bold', color: COLORS.primary },
  name: { fontSize: 22, fontFamily: 'Poppins-Bold', color: '#555' },
  email: { fontSize: 13, color: '#999', marginTop: 4, fontFamily: 'Poppins-Medium' },
  infoWrapper: { paddingHorizontal: 24, marginTop: 24 },
  infoCardOuter: { borderRadius: 24, backgroundColor: COLORS.bg },
  infoCardInner: { borderRadius: 24, backgroundColor: COLORS.bg },
  infoContent: { padding: 24 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  infoLabel: { fontSize: 11, color: '#AAA', fontFamily: 'Poppins-Bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 14, color: '#666', fontFamily: 'Poppins-SemiBold', marginTop: 2 },
  logoutWrapper: { paddingHorizontal: 24, marginTop: 40 },
  logoutBtnOuter: { borderRadius: 20, backgroundColor: COLORS.bg },
  logoutBtnInner: { paddingVertical: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  logoutText: { fontSize: 14, fontFamily: 'Poppins-Bold', color: COLORS.danger, letterSpacing: 1 },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)', justifyContent: 'center', alignItems: 'center', padding: 24, zIndex: 1000 },
  modalOuter: { borderRadius: 40, backgroundColor: COLORS.bg, width: '100%', maxWidth: 340 },
  modalInner: { borderRadius: 40, backgroundColor: COLORS.bg },
  modalContent: { padding: 32, alignItems: 'center' },
  warningIcon: { 
    width: 70, height: 70, borderRadius: 25, backgroundColor: COLORS.bg, 
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)',
    ...Platform.select({ web: { boxShadow: '4px 4px 10px rgba(0,0,0,0.05), -4px -4px 10px rgba(255,255,255,0.8)' } })
  },
  modalTitle: { fontSize: 20, fontFamily: 'Poppins-Bold', color: '#444', marginBottom: 8 },
  modalSub: { fontSize: 13, color: '#888', textAlign: 'center', fontFamily: 'Poppins-Regular', marginBottom: 32, lineHeight: 20 },
  modalActions: { flexDirection: 'row', gap: 16, width: '100%' },
  modalBtnCancel: { flex: 1, height: 55, borderRadius: 18, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  modalBtnCancelText: { fontSize: 14, fontFamily: 'Poppins-Bold', color: '#999' },
  modalBtnConfirm: { flex: 1.5 },
  modalBtnConfirmInner: { height: 55, borderRadius: 18, backgroundColor: COLORS.danger, alignItems: 'center', justifyContent: 'center' },
  modalBtnConfirmText: { fontSize: 14, fontFamily: 'Poppins-Bold', color: '#FFF' },

  editInputOuter: { borderRadius: 12, backgroundColor: COLORS.bg, marginTop: 6 },
  editInputInner: { borderRadius: 12, backgroundColor: COLORS.bg, height: 48, justifyContent: 'center', paddingHorizontal: 12 },
  editInput: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#555', padding: 0 },
  editActionsRow: { flexDirection: 'row', gap: 12 },
  editBtnCancel: { flex: 1, height: 48, borderRadius: 12, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  editBtnCancelText: { fontSize: 13, fontFamily: 'Poppins-Bold', color: '#999' },
  editBtnSave: { flex: 1.5 },
  editBtnSaveInner: { height: 48, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  editBtnSaveText: { fontSize: 13, fontFamily: 'Poppins-Bold', color: '#FFF' },
  editToggleBtnOuter: { borderRadius: 14, backgroundColor: COLORS.bg },
  editToggleBtnInner: { height: 48, borderRadius: 14, backgroundColor: COLORS.bg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  editToggleBtnText: { fontSize: 13, fontFamily: 'Poppins-Bold', color: COLORS.primary },

  modalInputOuter: { borderRadius: 14, backgroundColor: COLORS.bg, width: '100%' },
  modalInputInner: { borderRadius: 14, backgroundColor: COLORS.bg, height: 50, justifyContent: 'center', paddingHorizontal: 16 },
  modalTextInput: { fontSize: 13, fontFamily: 'Poppins-Medium', color: '#555', padding: 0 },
});

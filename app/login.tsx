import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../src/constants/colors';
import { useAuth } from '../src/context/AuthContext';
import { useToast } from '../src/context/ToastContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const imageHeight = screenWidth * (782 / 1024);
  const bannerHeight = Math.max(310, imageHeight);

  const [showPassword, setShowPassword] = useState(false);

  // Load remembered email on mount
  useEffect(() => {
    const loadRememberedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('remembered_email');
        const isChecked = await AsyncStorage.getItem('remember_me_checked');
        if (savedEmail) {
          setEmail(savedEmail);
        }
        if (isChecked === 'true') {
          setRememberMe(true);
        }
      } catch (err) {
        console.log('Error loading remembered email:', err);
      }
    };
    loadRememberedEmail();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('Harap isi semua field');
      return;
    }

    try {
      const res = await login(email, password) as any;
      if (res.success) {
        // Save or clear email in AsyncStorage based on Remember Me checkbox
        if (rememberMe) {
          await AsyncStorage.setItem('remembered_email', email);
          await AsyncStorage.setItem('remember_me_checked', 'true');
        } else {
          await AsyncStorage.removeItem('remembered_email');
          await AsyncStorage.setItem('remember_me_checked', 'false');
        }
        showToast('Selamat datang!');
        router.replace('/(tabs)');
      } else {
        showToast(res.message || 'Login gagal');
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      let errMsg = 'Terjadi kesalahan koneksi';
      if (error.response && error.response.data && error.response.data.message) {
        errMsg = error.response.data.message;
      } else if (error.message) {
        errMsg = error.message;
      }
      showToast(errMsg);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: COLORS.bg }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, backgroundColor: COLORS.bg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Banner (Teal Gradient) */}
        <LinearGradient
          colors={['#56C3E2', '#56C3E2']}
          style={{
            paddingTop: insets.top + 28,
            paddingHorizontal: 24,
            position: 'relative',
            height: bannerHeight,
            overflow: 'hidden',
          }}
        >
          {/* Laundry Vector Illustration positioned to span exactly full width */}
          <Image
            source={require('../assets/images/laundry_login_vector.webp')}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: imageHeight,
              resizeMode: 'contain'
            }}
          />

          <View style={{ 
            width: '100%', 
            alignItems: 'center', 
            zIndex: 10, 
            elevation: 10,
            position: 'relative'
          }}>
            <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: '#1E293B', textAlign: 'center' }}>
              Pantau laundry anda di
            </Text>
            <Text style={{ fontSize: 36, fontFamily: 'PlusJakartaSans-ExtraBold', color: '#1E293B', letterSpacing: 3, marginTop: 2, textShadowColor: 'rgba(255,255,255,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3, textAlign: 'center' }}>
              LUSTRA
            </Text>
          </View>
        </LinearGradient>

        {/* Bottom Login Form Card */}
        <View style={{
          flex: 1,
          backgroundColor: '#FFF',
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          marginTop: -30,
          paddingHorizontal: 24,
          paddingTop: 36,
          paddingBottom: insets.bottom + 24,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
            },
            android: {
              elevation: 10,
            },
            web: {
              boxShadow: '0 -8px 24px rgba(0,0,0,0.04)'
            }
          })
        }}>
          <Text style={{ fontSize: 28, fontFamily: 'PlusJakartaSans-Bold', color: '#1E293B', textAlign: 'center', marginBottom: 6 }}>
            Login
          </Text>
          <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans-Medium', color: '#94A3B8', textAlign: 'center', marginBottom: 28 }}>
            Pelanggan Setia LUSTRA Laundry
          </Text>

          {/* Email Input */}
          <View style={{ marginBottom: 16 }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              borderRadius: 30,
              height: 54,
              paddingHorizontal: 20,
              borderWidth: 1.5,
              borderColor: '#E2E8F0'
            }}>
              <Ionicons name="mail-outline" size={20} color="#94A3B8" style={{ marginRight: 12 }} />
              <TextInput
                style={{ flex: 1, fontSize: 14, fontFamily: 'PlusJakartaSans-SemiBold', color: '#334155', padding: 0 }}
                placeholder="Masukkan email anda"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={{ marginBottom: 16 }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              borderRadius: 30,
              height: 54,
              paddingHorizontal: 20,
              borderWidth: 1.5,
              borderColor: '#E2E8F0'
            }}>
              <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={{ marginRight: 12 }} />
              <TextInput
                style={{ flex: 1, fontSize: 14, fontFamily: 'PlusJakartaSans-SemiBold', color: '#334155', padding: 0 }}
                placeholder="Masukkan password anda"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ padding: 4 }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember Me Checkbox & Forgot Password */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 4, marginBottom: 28 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setRememberMe(!rememberMe)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <Ionicons
                name={rememberMe ? "checkbox" : "square-outline"}
                size={20}
                color={rememberMe ? '#56C3E2' : "#94A3B8"}
              />
              <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans-Medium', color: '#64748B' }}>Remember Me</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => showToast('Hubungi Admin untuk reset password', 'info')}>
              <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans-Bold', color: '#56C3E2' }}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={{
              height: 54,
              borderRadius: 27,
              backgroundColor: '#56C3E2',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#56C3E2',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 4
            }}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={{ color: '#FFF', fontSize: 16, fontFamily: 'PlusJakartaSans-Bold' }}>Login</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

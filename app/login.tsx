import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { COLORS, getSoftShadow } from '../src/constants/colors';
import { useToast } from '../src/context/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Stop, Circle, Path, G, Text as SvgText } from 'react-native-svg';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('Harap isi semua field');
      return;
    }

    try {
      const res = await login(email, password);
      if (res.success) {
        showToast('Selamat datang!');
        router.replace('/(tabs)');
      } else {
        showToast(res.message || 'Login gagal');
      }
    } catch (error) {
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
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Svg width={240} height={80} viewBox="0 0 200 65" style={{ alignSelf: 'center', marginBottom: 10 }}>
            <Defs>
              <LinearGradient id="lustra-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#59C1BD" />
                <Stop offset="100%" stopColor="#59C1BD" />
              </LinearGradient>
              <LinearGradient id="glass-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
                <Stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
              </LinearGradient>
            </Defs>
            
            {/* Glassmorphic Layer (Circles) */}
            <Circle cx="38" cy="28" r="21" fill="url(#glass-glow)" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" />
            <Circle cx="54" cy="35" r="15" fill="rgba(89, 193, 189, 0.12)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />

            {/* Minimalist Fluid Wave Lines */}
            <Path d="M 18,48 C 50,38 90,56 125,44 C 160,32 175,46 190,40" fill="none" stroke="url(#lustra-grad)" strokeWidth="2.5" strokeLinecap="round" />
            <Path d="M 28,52 C 55,44 85,58 115,49" fill="none" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="1.5" strokeLinecap="round" />

            {/* LUSTRA Brand Text */}
            <SvgText x="35" y="38" fill="url(#lustra-grad)" fontFamily="Poppins-ExtraBold" fontWeight="900" fontSize="28" letterSpacing="3">LUSTRA</SvgText>

            {/* 4-Pointed Sparkle (Concave Star) above U */}
            <G transform="translate(71, 6) scale(0.35)">
              <Path d="M 20,0 Q 20,20 0,20 Q 20,20 20,40 Q 20,20 40,20 Q 20,20 20,0 Z" fill="url(#lustra-grad)" />
            </G>
            {/* Another tiny sparkle above A */}
            <G transform="translate(139, 4) scale(0.2)" opacity="0.8">
              <Path d="M 20,0 Q 20,20 0,20 Q 20,20 20,40 Q 20,20 40,20 Q 20,20 20,0 Z" fill="#59C1BD" />
            </G>
          </Svg>
          
          <Text style={styles.subTitle}>Sistem Pelacakan Cucian Real-Time</Text>
        </View>

        <View style={[styles.formCardOuter, getSoftShadow(true)]}>
          <View style={[styles.formCardInner, getSoftShadow(false)]}>
            <View style={styles.formPadding}>
              
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputOuter, getSoftShadow(true)]}>
                <View style={[styles.inputInner, getSoftShadow(false)]}>
                  <Ionicons name="mail-outline" size={20} color="#94A3B8" style={{marginRight: 10}} />
                  <TextInput
                    style={styles.input}
                    placeholder="email@contoh.com"
                    placeholderTextColor="#CBD5E1"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <Text style={[styles.label, { marginTop: 24 }]}>Password</Text>
              <View style={[styles.inputOuter, getSoftShadow(true)]}>
                <View style={[styles.inputInner, getSoftShadow(false)]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={{marginRight: 10}} />
                  <TextInput
                    style={styles.input}
                    placeholder="password"
                    placeholderTextColor="#CBD5E1"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.loginBtnOuter, getSoftShadow(true)]} 
                onPress={handleLogin}
                disabled={isLoading}
              >
                <View style={[styles.loginBtnInner, getSoftShadow(false)]}>
                  {isLoading ? (
                    <ActivityIndicator color={COLORS.primary} />
                  ) : (
                    <Text style={styles.loginBtnText}>MASUK SEKARANG</Text>
                  )}
                </View>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 25 },
  subTitle: { fontSize: 13, fontFamily: 'Poppins-Medium', color: '#64748B', marginTop: 12 },
  
  formCardOuter: { borderRadius: 35, backgroundColor: COLORS.bg },
  formCardInner: { borderRadius: 35, backgroundColor: COLORS.bg },
  formPadding: { padding: 30 },
  
  label: { fontSize: 12, fontFamily: 'Poppins-Bold', color: '#94A3B8', marginBottom: 12, marginLeft: 5, textTransform: 'uppercase' },
  
  inputOuter: { borderRadius: 20, backgroundColor: COLORS.bg },
  inputInner: { 
    borderRadius: 20, backgroundColor: COLORS.bg, height: 60, 
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 
  },
  input: { flex: 1, fontSize: 15, fontFamily: 'Poppins-SemiBold', color: COLORS.primary },
  
  loginBtnOuter: { marginTop: 40, borderRadius: 25, backgroundColor: COLORS.bg },
  loginBtnInner: { 
    height: 64, borderRadius: 25, backgroundColor: COLORS.bg, 
    alignItems: 'center', justifyContent: 'center' 
  },
  loginBtnText: { color: COLORS.primary, fontSize: 16, fontFamily: 'Poppins-ExtraBold', letterSpacing: 2 },
});

import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from '../src/context/ToastContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { COLORS } from '../src/constants/colors';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Cek apakah kita sedang di halaman login
    const inLoginGroup = segments[0] === 'login' || segments[0] === undefined;

    const navigate = () => {
      if (!isAuthenticated && !inLoginGroup) {
        // Jika belum login dan tidak di halaman login, tendang ke login
        router.replace('/login');
      } else if (isAuthenticated && (segments[0] === 'login' || segments[0] === undefined)) {
        // Jika sudah login tapi masih di login/root, pindah ke beranda
        router.replace('/(tabs)');
      }
    };

    // Defer navigasi ke microtask/tick berikutnya agar Root Layout terpasang (mounted) terlebih dahulu
    const timeout = setTimeout(navigate, 0);
    return () => clearTimeout(timeout);
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ gestureEnabled: false }} />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="detail/[id]" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Regular.ttf',
    'Poppins-Medium': 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Medium.ttf',
    'Poppins-SemiBold': 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-SemiBold.ttf',
    'Poppins-Bold': 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Bold.ttf',
    'Poppins-ExtraBold': 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-ExtraBold.ttf',
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ToastProvider>
          <RootNavigator />
          <StatusBar style="dark" />
        </ToastProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
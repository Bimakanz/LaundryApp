import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getSoftShadow } from '../../src/constants/colors';

function SoftTabButton({ children, onPress, accessibilityState }) {
  const focused = accessibilityState?.selected ?? false;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      style={styles.btnContainer}
    >
      <View style={[
        styles.btnWrapper,
        focused ? styles.btnActive : styles.btnInactive,
      ]}>
        {children}
      </View>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2DD4BF', 
        tabBarInactiveTintColor: '#94A3B8',
        tabBarShowLabel: false, // Hilangkan tulisan
        tabBarButton: (props) => <SoftTabButton {...props} />,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 32 : 20,
          left: 30,
          right: 30,
          backgroundColor: COLORS.bg, // Menggunakan warna #E2E8F0 dari konstanta
          borderRadius: 40,
          height: 70, 
          borderWidth: 1.5,
          borderTopColor: '#FFFFFF',
          borderLeftColor: '#FFFFFF',
          borderBottomColor: 'rgba(163, 177, 198, 0.45)',
          borderRightColor: 'rgba(163, 177, 198, 0.45)',
          ...Platform.select({
            ios: {
              shadowColor: '#A3B1C6',
              shadowOffset: { width: 6, height: 6 },
              shadowOpacity: 0.8,
              shadowRadius: 8,
            },
            android: { 
              elevation: 8,
            },
            web: { 
              boxShadow: '8px 8px 16px rgba(163, 177, 198, 0.7), -8px -8px 16px rgba(255, 255, 255, 1)' 
            }
          }),
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notif',
          tabBarIcon: ({ color }) => <Ionicons name="notifications" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={26} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  btnContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnWrapper: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: 65, // Bentuk lingkaran/kotak rounded untuk ikon saja
    height: 50,
  },
  btnActive: {
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      web: {
        boxShadow: 'inset 3px 3px 6px rgba(0,0,0,0.05), inset -3px -3px 6px rgba(255,255,255,0.8)'
      }
    })
  },
  btnInactive: {
    backgroundColor: 'transparent',
  }
});

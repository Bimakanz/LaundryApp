import { Platform } from 'react-native';

export const COLORS = {
  // EXACT COLORS FROM WEB DASHBOARD
  bg: '#E2E8F0', // Clean distinct slate-blue from LaundrySertikom
  surface: '#FFFFFF',
  
  primary: '#49C8BE', // Navy
  teal: '#59C1BD',
  white: '#FFFFFF',
  
  // Status Colors from Web
  antrian: '#F59E0B',
  dicuci: '#59C1BD',
  disetrika: '#8B5CF6',
  siap_ambil: '#10B981',
  
  text_primary: '#1E293B',
  text_secondary: '#64748B',
  
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
};

// DRAMATIC SOFT UI SHADOWS FOR WEB & MOBILE
export const getSoftShadow = (isDark = true) => {
  if (Platform.OS === 'web') {
    return isDark 
      ? { boxShadow: '8px 8px 16px rgba(163, 177, 198, 0.7), 2px 2px 6px rgba(0,0,0,0.08)' } 
      : { boxShadow: '-8px -8px 16px rgba(255, 255, 255, 1)' };
  }
  
  return isDark ? {
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6, // Centered sharp depth shadow on Android!
  } : {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -6, height: -6 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 0,
    // Simulasikan efek kedalaman Neumorphic di perangkat HP Native (iOS/Android)
    borderWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomColor: 'rgba(163, 177, 198, 0.35)',
    borderRightColor: 'rgba(163, 177, 198, 0.35)',
  };
};

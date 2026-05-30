import { Platform } from 'react-native';

export const COLORS = {
  // EXACT COLORS FROM WEB DASHBOARD
  bg: '#F8FAFC', // Clean minimalist light-gray
  surface: '#FFFFFF',
  
  primary: '#56C3E2', // Sky blue brand accent
  teal: '#56C3E2',
  white: '#FFFFFF',
  
  // Status Colors from Web
  antrian: '#F59E0B',
  dicuci: '#56C3E2',
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
  if (!isDark) {
    // Inner container does not need double shadows in flat design
    return {};
  }
  
  if (Platform.OS === 'web') {
    return {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)'
    };
  }
  
  return {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  };
};

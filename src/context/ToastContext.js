import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, Animated, Platform } from 'react-native';
import { COLORS, getSoftShadow } from '../constants/colors';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ visible: false, message: '' });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const showToast = useCallback((message) => {
    setToast({ visible: true, message });
    
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -50, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        setToast({ visible: false, message: '' });
      });
    }, 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.visible && (
        <Animated.View style={[
          { 
            position: 'absolute', 
            top: 60, 
            left: 24, 
            right: 24, 
            borderRadius: 16, 
            backgroundColor: '#FFFFFF', 
            borderWidth: 1, 
            borderColor: '#E2E8F0', 
            zIndex: 9999 
          }, 
          getSoftShadow(true),
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
          <View style={{ paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: COLORS.text_primary, fontSize: 14, fontFamily: 'PlusJakartaSans-SemiBold', textAlign: 'center' }}>{toast.message}</Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};


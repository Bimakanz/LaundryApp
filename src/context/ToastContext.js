import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
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
          styles.toastOuter, 
          getSoftShadow(true),
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
          <View style={[styles.toastInner, getSoftShadow(false)]}>
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastOuter: {
    position: 'absolute',
    top: 60, // Di bawah status bar
    left: 24,
    right: 24,
    borderRadius: 20,
    backgroundColor: COLORS.bg,
    zIndex: 9999,
  },
  toastInner: {
    borderRadius: 20,
    backgroundColor: COLORS.bg,
    paddingVertical: 18,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    color: COLORS.primary,
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  }
});

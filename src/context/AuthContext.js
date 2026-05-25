import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { login as loginApi } from '../api/auth';

const AuthContext = createContext({
  isAuthenticated: false,
  isLoading: false,
  login: async (email, password) => {},
  signIn: async (token, user) => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('bilas_token');
      const userData = await AsyncStorage.getItem('bilas_user');
      if (token && userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    } catch {}
    setIsLoading(false);
  };

  const login = async (email, password) => {
    setIsLoggingIn(true);
    try {
      const res = await loginApi(email, password);
      if (res.success) {
        // Data Laravel ada di dalam res.data
        const { token, user } = res.data;
        await signIn(token, user);
      }
      return res;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const [user, setUser] = useState(null);

  const signIn = async (token, userData) => {
    try {
      await AsyncStorage.setItem('bilas_token', token);
      await AsyncStorage.setItem('bilas_user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    } catch (e) {
      console.error('Save Token Error:', e);
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('bilas_token');
    await AsyncStorage.removeItem('bilas_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, isLoading: isLoggingIn, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
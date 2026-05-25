import axios, { AxiosHeaders } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

/**
 * Deteksi body multipart yang dipakai RN / browser (tidak selalu instanceof FormData global).
 */
function isFormDataPayload(data) {
  if (data == null) return false;
  if (typeof FormData !== 'undefined' && data instanceof FormData) return true;
  return typeof data.append === 'function' && typeof data.getParts === 'function';
}

/**
 * Axios v1 + default Content-Type: application/json:
 * - transformRequest akan memanggil JSON.stringify(formDataToJSON(data)) jika masih terlihat seperti JSON.
 * - Di React Native, resolveConfig tidak mengosongkan Content-Type untuk FormData (tidak seperti browser).
 * - dispatchRequest lalu memaksa application/x-www-form-urlencoded pada POST kecuali Content-Type sudah ada.
 *
 * Menyetel Content-Type ke `false` adalah kontrak Axios: header diabaikan di XHR (lihat AxiosHeaders.toJSON),
 * sehingga runtime mengatur multipart boundary, dan setContentType(urlencoded, false) tidak menimpa entri yang ada.
 */
import { Platform } from 'react-native';

function prepareFormDataRequest(config) {
  const headers = AxiosHeaders.from(config.headers);
  if (Platform.OS === 'web') {
    headers.delete('Content-Type');
    headers.delete('content-type');
    // false = jangan kirim header; Browser mengisi boundary secara otomatis
    headers.setContentType(false);
  } else {
    // Pada perangkat Native, tetapkan multipart/form-data secara eksplisit agar XHR bridge memproses file dengan benar
    headers.set('Content-Type', 'multipart/form-data');
  }
  config.headers = headers;
}

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('bilas_token');
  if (token) {
    config.headers = AxiosHeaders.from(config.headers);
    config.headers.setAuthorization(`Bearer ${token}`);
  }

  if (isFormDataPayload(config.data)) {
    prepareFormDataRequest(config);
  }

  return config;
});

client.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await AsyncStorage.removeItem('bilas_token');
      await AsyncStorage.removeItem('bilas_user');
    }
    return Promise.reject(error);
  }
);

export default client;

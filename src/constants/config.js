import { Platform } from 'react-native';

const IP_LAPTOP = '172.16.0.57'; 
const PORT = '8000';

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    // Gunakan alamat yang sama dengan yang muncul di browser Anda
    return `http://localhost:${PORT}`; 
  }
  return `http://${IP_LAPTOP}:${PORT}`;
};

export const API_BASE_URL = getBaseUrl();
export const API_URL = `${API_BASE_URL}/api`;

export default {
  API_BASE_URL,
  API_URL,
};

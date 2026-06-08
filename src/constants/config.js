import { Platform } from 'react-native';

const IP_LAPTOP = '171.16.0.9'; // Updated IP address
const PORT = '8000';

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    // Gunakan alamat yang sama dengan yang munc  ul di browser Anda
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

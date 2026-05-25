import client from './client';

export const login = (email, password) =>
  client.post('/auth/login', { email, password });

export const logout = () => client.post('/auth/logout');

export const getProfile = () => client.get('/auth/profile');

export const updateProfile = (data) => client.put('/auth/profile', data);

export const changePassword = (current_password, new_password) =>
  client.put('/auth/change-password', { current_password, new_password });

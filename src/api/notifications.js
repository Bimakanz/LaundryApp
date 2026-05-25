import client from './client';

export const getMyNotifications = () => client.get('/notifications');
export const markNotificationsAsRead = () => client.put('/notifications/mark-read');
export const markSingleNotificationAsRead = (id) => client.put(`/notifications/${id}/mark-read`);

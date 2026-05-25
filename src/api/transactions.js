import client from './client';

export const getMyLaundry = () => client.get('/status-laundry');

export const getTransactionDetail = (id) => client.get(`/transactions/${id}`);

export const uploadPaymentProof = (id, formData) =>
  client.post(`/transactions/${id}/payment-proof`, formData);

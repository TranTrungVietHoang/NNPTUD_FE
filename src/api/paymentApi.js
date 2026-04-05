import axiosClient from './axiosClient';

const paymentApi = {
  create: (data) => axiosClient.post('/payments', data),
  approve: (id) => axiosClient.put(`/payments/${id}`, { status: 'paid' }),
};

export default paymentApi;

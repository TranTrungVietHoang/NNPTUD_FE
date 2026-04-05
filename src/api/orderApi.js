import axiosClient from './axiosClient';

const orderApi = {
  getAll: () => axiosClient.get('/orders'),
  create: (data) => axiosClient.post('/orders', data),
  updateStatus: (id, data) => axiosClient.put(`/orders/${id}`, data),
};

export default orderApi;

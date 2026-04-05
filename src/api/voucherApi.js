import axiosClient from './axiosClient';

const voucherApi = {
  getPublic: () => axiosClient.get('/vouchers'),
  getAdmin: () => axiosClient.get('/vouchers/admin'),
  check: (code, amount) => axiosClient.get(`/vouchers/check/${code}`, { params: { amount } }),
  create: (data) => axiosClient.post('/vouchers', data),
};

export default voucherApi;

import axiosClient from './axiosClient';

const supplierApi = {
  getAll: () => axiosClient.get('/suppliers'),
  create: (data) => axiosClient.post('/suppliers', data),
};

export default supplierApi;

import axiosClient from './axiosClient';

const inventoryApi = {
  getAll: () => axiosClient.get('/inventories'),
  getByProduct: (productId) => axiosClient.get(`/inventories/product/${productId}`),
  getLowStock: () => axiosClient.get('/inventories/low-stock'),
};

export default inventoryApi;

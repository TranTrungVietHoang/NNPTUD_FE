import axiosClient from './axiosClient';

const cartApi = {
  getCart: () => axiosClient.get('/carts'),
  addItem: (data) => axiosClient.post('/carts/add', data),
  modifyItem: (data) => axiosClient.post('/carts/modify', data),
  decreaseItem: (data) => axiosClient.post('/carts/decrease', data),
  removeItem: (data) => axiosClient.post('/carts/remove', data),
};

export default cartApi;

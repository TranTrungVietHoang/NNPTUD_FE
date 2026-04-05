import axiosClient from './axiosClient';

const reviewApi = {
  getByProduct: (productId) => axiosClient.get(`/reviews/product/${productId}`),
  create: (data) => axiosClient.post('/reviews', data),
  checkEligibility: (productId) => axiosClient.get(`/reviews/check-eligibility/${productId}`),
  toggleVisibility: (id) => axiosClient.patch(`/reviews/${id}/toggle`),
  getAll: () => axiosClient.get('/reviews'),
};

export default reviewApi;

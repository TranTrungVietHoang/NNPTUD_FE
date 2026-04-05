import axiosClient from './axiosClient';

const userApi = {
  getAll: () => axiosClient.get('/users'),
  getAdmins: () => axiosClient.get('/users/admins'),
  update: (id, data) => axiosClient.put(`/users/${id}`, data),
  updateProfile: (data) => axiosClient.put('/users/profile', data),
  changePassword: (data) => axiosClient.put('/users/change-password', data),
};

export default userApi;

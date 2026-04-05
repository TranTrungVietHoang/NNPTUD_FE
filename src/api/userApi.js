import axiosClient from './axiosClient';

const userApi = {
  getAll: () => axiosClient.get('/users'),
  getAdmins: () => axiosClient.get('/users/admins'),
  update: (id, data) => axiosClient.put(`/users/${id}`, data),
};

export default userApi;

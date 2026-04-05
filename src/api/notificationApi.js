import axiosClient from './axiosClient';

const notificationApi = {
  getAll: () => axiosClient.get('/notifications'),
  markAllRead: () => axiosClient.put('/notifications/read-all'),
};

export default notificationApi;

import axiosClient from './axiosClient';

const messageApi = {
  getHistory: (userId) => axiosClient.get(`/messages/${userId}`),
  send: (data) => axiosClient.post('/messages', data),
  getConversations: () => axiosClient.get('/messages'),
};

export default messageApi;

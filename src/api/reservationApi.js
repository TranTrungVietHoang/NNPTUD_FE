import axiosClient from './axiosClient';

const reservationApi = {
  create: (data) => axiosClient.post('/reservations', data),
};

export default reservationApi;

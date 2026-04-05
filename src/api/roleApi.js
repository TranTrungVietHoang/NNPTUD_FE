import axiosClient from './axiosClient';

const roleApi = {
  getAll: () => axiosClient.get('/roles'),
};

export default roleApi;

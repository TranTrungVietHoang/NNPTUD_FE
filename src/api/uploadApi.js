import axiosClient from './axiosClient';

const uploadApi = {
  uploadImage: (formData) =>
    axiosClient.post('/upload/an_image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadExcel: (formData) =>
    axiosClient.post('/upload/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default uploadApi;

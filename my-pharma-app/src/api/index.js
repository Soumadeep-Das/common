import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

export const getPharmacies = () => axios.get(`${BASE_URL}/pharmacies`);
export const getDepartments = () => axios.get(`${BASE_URL}/departments`);
export const getDoctors = (filters = {}, page = 1, limit = 10) => {
  return axios.post(`${BASE_URL}/doctors-dept`, { filters, page, limit });
};
export const getDoctorDetails = (doctorId) => axios.get(`${BASE_URL}/doctors/${doctorId}`);

export const getPharmacyDoctorDetails = () => axios.get(`${BASE_URL}/pharmacy-doctor`);
export const getProfile = () => {
  const token = localStorage.getItem('token');
  return axios.get(`${BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(res => res.data);
};

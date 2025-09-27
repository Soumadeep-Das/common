import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

export const getPharmacies = () => axios.get(`${BASE_URL}/pharmacies`);
export const getDoctors = () => axios.get(`${BASE_URL}/doc-pharma-dept`);
export const getPharmacyDoctorDetails = () => axios.get(`${BASE_URL}/pharmacy-doctor`);
export const getProfile = () => {
  const token = localStorage.getItem('token');
  return axios.get(`${BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(res => res.data);
};

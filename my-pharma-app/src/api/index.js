import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

export const getPharmacies = () => axios.get(`${BASE_URL}/pharmacies`);
export const getDepartments = () => axios.get(`${BASE_URL}/departments`);
export const getDoctors = (filters = {}, page = 1, limit = 10) => {
  return axios.post(`${BASE_URL}/doctors-dept`, { filters, page, limit });
};
export const getDoctorDetails = (doctorId) => axios.get(`${BASE_URL}/doctors/${doctorId}`);
export const bookAppointment = (data) => {
  const token = localStorage.getItem('token');
  return axios.post(`${BASE_URL}/book-appointment`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const getPatientAppointments = () => {
  const token = localStorage.getItem('token');
  return axios.get(`${BASE_URL}/appointments/patient`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const cancelAppointment = (appointmentId) => {
  const token = localStorage.getItem('token');
  return axios.put(`${BASE_URL}/appointments/${appointmentId}/cancel`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};



export const getPharmacyDoctorDetails = () => axios.get(`${BASE_URL}/pharmacy-doctor`);
export const getProfile = () => {
  const token = localStorage.getItem('token');
  return axios.get(`${BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(res => res.data);
};

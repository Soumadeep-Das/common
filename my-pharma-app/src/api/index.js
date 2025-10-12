import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

// Add response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getPharmacies = () => axios.get(`${BASE_URL}/pharmacies`);
export const getDepartments = () => axios.get(`${BASE_URL}/departments`);
export const getDoctors = (filters = {}, page = 1, limit = 10) => {
  return axios.post(`${BASE_URL}/doctors-dept`, { filters, page, limit });
};
export const getSlotDetails = (doctorId) => axios.get(`${BASE_URL}/slots/${doctorId}`);
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
  return axios.get(`${BASE_URL}/appointments/patient-appointments`, {
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
export const getDoctorsByPharmacy = (pharmacyId) => axios.get(`${BASE_URL}/pharmacy/${pharmacyId}/doctors`);



export const getPharmacySlotDetails = () => axios.get(`${BASE_URL}/pharmacy-doctor`);
export const getProfile = () => {
  const token = localStorage.getItem('token');
  return axios.get(`${BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(res => res.data);
};

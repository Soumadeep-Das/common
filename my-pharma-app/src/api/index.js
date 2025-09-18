import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

export const getPharmacies = () => axios.get(`${BASE_URL}/pharmacies`);
export const getDoctors = () => axios.get(`${BASE_URL}/doc-pharma-dept`);
export const getPharmacyDoctorDetails = () => axios.get(`${BASE_URL}/pharmacy-doctor`);

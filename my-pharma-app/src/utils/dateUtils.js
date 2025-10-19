export const formatAppointmentDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

export const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

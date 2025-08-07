export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const isToday = (date) => {
  const today = new Date().toDateString();
  return new Date(date).toDateString() === today;
};

export const daysDifference = (date1, date2) => {
  const diffTime = new Date(date1) - new Date(date2);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
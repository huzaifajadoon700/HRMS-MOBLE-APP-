import axios from "axios";

const API_URL = "http://localhost:8080/api/bookings";

// Create a new booking
export const createBooking = async (bookingData, token) => {
  return await axios.post(API_URL, bookingData, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Fetch all bookings
export const getBookings = async (token) => {
  return await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Fetch bookings by user - fixed to use the correct endpoint
export const getBookingsByUser = async (token) => {
  return await axios.get(`${API_URL}/user`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Update booking
export const updateBooking = async (id, updatedData, token) => {
  return await axios.put(`${API_URL}/${id}`, updatedData, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Delete a booking
export const deleteBooking = async (id, token) => {
  return await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

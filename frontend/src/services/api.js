import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Attach JWT Token to every outgoing request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('aquatrack_user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default API;
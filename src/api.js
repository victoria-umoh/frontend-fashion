import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

export default API;

// import axios from 'axios';

// const getApiBaseUrl = () => {
//   let url = process.env.REACT_APP_API_URL || process.env.VITE_API_URL || 'http://localhost:5000';
//   if (typeof url === 'string') url = url.trim();
//   return url;
// };

// const API = axios.create({
//   baseURL: getApiBaseUrl(),
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: true,
// });

// API.interceptors.request.use(
//   (config) => {
//     const userInfo = localStorage.getItem('userInfo') 
//       ? JSON.parse(localStorage.getItem('userInfo')) 
//       : null;
    
//     if (userInfo && userInfo.token) {
//       config.headers.Authorization = `Bearer ${userInfo.token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// API.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const message = error.response?.data?.message || error.message || 'An error occurred';
//     console.error('API Error:', message);
    
//     if (error.response?.status === 401) {
//       localStorage.removeItem('userInfo');
//       window.location.href = '/login';
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default API;
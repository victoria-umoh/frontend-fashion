import axios from 'axios';
import { isSupabaseConfigured, supabase } from './supabase';

const supabaseApiUrl = process.env.REACT_APP_SUPABASE_URL
  ? `${process.env.REACT_APP_SUPABASE_URL.replace(/\/$/, '')}/functions/v1`
  : null;
const baseURL = process.env.REACT_APP_API_URL || supabaseApiUrl || 'http://localhost:5001';

const API = axios.create({
  baseURL,
});

API.interceptors?.request?.use(async (config) => {
  if (!isSupabaseConfigured || !supabase) return config;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (data.session?.access_token) {
    config.headers.Authorization = `Bearer ${data.session.access_token}`;
  } else {
    delete config.headers.Authorization;
    localStorage.removeItem('userInfo');
  }
  return config;
});

export const getImageUrl = (image) => {
  if (!image) return '';
  const imageBaseUrl = supabaseApiUrl && typeof window !== 'undefined'
    ? window.location.origin
    : API.defaults.baseURL;
  return new URL(image, imageBaseUrl).toString();
};

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
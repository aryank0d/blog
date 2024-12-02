import axios from 'axios';

const BASE_URL = 'http://localhost:8083/api';

const API = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        console.log('Making request:', config.method.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

API.interceptors.response.use(
    (response) => {
        console.log('Response received:', response.status, response.data);
        return response;
    },
    (error) => {
        if (error.response) {
            console.error('API Error:', {
                status: error.response.status,
                data: error.response.data,
                url: error.config?.url,
                method: error.config?.method
            });
        } else if (error.request) {
            console.error('Request Error:', error.request);
        } else {
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
        API.defaults.headers['Authorization'] = `Bearer ${token}`;
    } else {
        localStorage.removeItem('token');
        delete API.defaults.headers['Authorization'];
    }
};

export default API;
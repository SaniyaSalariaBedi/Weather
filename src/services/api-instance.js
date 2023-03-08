import axios from 'axios';

// Setting constants for username, password, and base URL for API
const USERNAME = 'vinter_saniya';
const PASSWORD = '5ypsI89G8O';
const BASE_URL = 'https://api.meteomatics.com'

// Setting the base URL for Login
const BASE_URL_LOGIN = 'https://login.meteomatics.com'

// Creating an axios instance for login authentication
export const loginInstance = axios.create({
    baseURL: `${BASE_URL_LOGIN}/api/v1/token`,
    headers: {
        'Authorization': `Basic ${btoa(USERNAME + ':' + PASSWORD)}`,
        // "access-control-allow-origin": "*",
    }
});

// Setting the base URL for a third-party map apis
const BASE_URL_MAPS = 'https://nominatim.openstreetmap.org'

// Creating an axios instance for the third-party map 
export const mapsThirdPartyInstance = axios.create({
    baseURL: BASE_URL_MAPS,
    headers: {
        // "access-control-allow-origin": "*",
    }
});

// Retrieving the authentication token from local storage
const AUTH_TOKEN = localStorage.getItem('authToken');

// Creating an axios instance for the API and adding the authentication token to the headers
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        // "access-control-allow-origin": "*",
    }
});

export default axiosInstance;
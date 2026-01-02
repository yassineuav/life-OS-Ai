import axios from 'axios';

const getBaseURL = () => {
    if (typeof window !== 'undefined') {
        return `http://${window.location.hostname}:8000`;
    }
    return 'http://localhost:8000';
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Queue to hold requests while token is refreshing
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!error.response) {
            console.error('API Error without response:', error);
            return Promise.reject(error);
        }

        console.log(`API Response Status: ${error.response.status} for ${originalRequest.url}`);

        // Skip for refresh endpoint itself to avoid infinite loops
        if (originalRequest.url?.includes('/auth/token/refresh/')) {
            console.error('Auth refresh endpoint returned error. Rejecting.');
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log('Detected 401. Attemping refresh. isRefreshing:', isRefreshing);

            if (isRefreshing) {
                console.log('Refresh already in progress. Enqueueing request:', originalRequest.url);
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    console.log('Retrying enqueued request with new token:', originalRequest.url);
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                console.warn('No refresh token found. Redirecting to login.');
                if (typeof window !== 'undefined') window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                console.log('POSTing to token refresh endpoint...');
                const response = await axios.post('http://localhost:8000/auth/token/refresh/', {
                    refresh: refreshToken,
                });

                const newToken = response.data.access;
                console.log('Successfully refreshed token.');
                localStorage.setItem('access_token', newToken);

                api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                processQueue(null, newToken);
                console.log('Retrying original request with new token:', originalRequest.url);
                return api(originalRequest);
            } catch (refreshError) {
                console.error('RefreshToken flow failed:', refreshError);
                processQueue(refreshError, null);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default api;

import axios from 'axios';

let baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

// Sửa lỗi CORS do Vercel Redirect: 
if (typeof window !== 'undefined' && baseURL.includes('vercel.app') && !window.location.hostname.includes('vercel.app')) {
    baseURL = '/api';
}

const api = axios.create({
    baseURL: baseURL,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: Gắn access token vào header
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Biến để kiểm soát quá trình refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response interceptor: Xử lý lỗi 401 (hết hạn token)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 và chưa được thử lại (retry)
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            // Nếu đang trong quá trình refresh, xếp hàng request này lại
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then(token => {
                    originalRequest.headers.Authorization = 'Bearer ' + token;
                    return api(originalRequest);
                })
                .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                // Không có refresh token, buộc đăng xuất
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login?expired=true';
                return Promise.reject(error);
            }

            try {
                // Gọi API cấp mới token — dùng axios gốc với relative URL
                // để tránh interceptor loop và hoạt động đúng cả local lẫn production
                const response = await axios.post('/api/auth/refresh-token', { refreshToken });
                const { accessToken, refreshToken: newRefreshToken } = response.data;

                // Lưu token mới
                localStorage.setItem('token', accessToken);
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken);
                }
                
                // Cập nhật header cho các request tương lai
                api.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
                originalRequest.headers.Authorization = 'Bearer ' + accessToken;
                
                // Giải phóng hàng đợi
                processQueue(null, accessToken);
                
                // Thử lại request ban đầu
                return api(originalRequest);
            } catch (err) {
                // Refresh token thất bại hoặc hết hạn
                processQueue(err, null);
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login?expired=true';
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;

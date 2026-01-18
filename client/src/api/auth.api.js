import api from './axios';

export const authApi = {
    login: async (email, password) => {
        const response = await api.post('auth/login/', { email, password });
        return response.data;
    },

    refreshToken: async (refresh) => {
        const response = await api.post('token/refresh/', { refresh });
        return response.data;
    },

    register: async (userData) => {
        const payload = {
            ...userData,
            password2: userData.password1
        };
        const response = await api.post('auth/registration/', payload);
        return response.data;
    },

    logout: async () => {
        const response = await api.post('auth/logout/');
        return response.data;
    }
};

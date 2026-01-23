import api from './axios';

export const userApi = {
    getCurrentUser: async () => {
        const response = await api.get('auth/user/');
        return response.data;
    },
    getProfile: async () => {
        const response = await api.get('profile/');
        return response.data;
    },
    updateProfile: async (data) => {
        // Use multipart/form-data if data contains a File (avatar)
        const config = {
            headers: {
                'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json'
            }
        };
        const response = await api.put('profile/', data, config);
        return response.data;
    }
};

import api from './axios';

export const userApi = {
    getCurrentUser: async () => {
        const response = await api.get('auth/user/');
        return response.data;
    },
};

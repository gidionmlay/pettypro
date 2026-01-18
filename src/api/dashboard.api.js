import api from './axios';

export const dashboardApi = {
    getStats: async () => {
        const response = await api.get('dashboard/');
        return response.data;
    },
};

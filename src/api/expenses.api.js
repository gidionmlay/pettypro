import api from './axios';

export const expensesApi = {
    getAll: async () => {
        const response = await api.get('expenses/');
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('expenses/', data);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`expenses/${id}/`);
    },
};

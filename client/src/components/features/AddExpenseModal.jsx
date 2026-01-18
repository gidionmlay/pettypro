import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { CurrencyDollar, Calendar, FileText, Tag, Upload } from 'react-bootstrap-icons';
import { expensesApi } from '../../api/expenses.api';
import api from '../../api/axios';

const AddExpenseModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        note: ''
    });
    const [categories, setCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            const fetchCategories = async () => {
                try {
                    const response = await api.get('categories/');
                    setCategories(response.data);
                } catch (err) {
                    console.error('Failed to fetch categories', err);
                    setCategories([]);
                }
            };
            fetchCategories();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            await expensesApi.create({
                amount: parseFloat(formData.amount),
                note: formData.note,
                category: formData.category ? parseInt(formData.category) : null,
                expense_date: new Date(formData.date).toISOString()
            });

            // Reset form
            setFormData({
                amount: '',
                category: '',
                date: new Date().toISOString().split('T')[0],
                note: ''
            });
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error("Expense create error response:", err.response?.data);

            // Extract error message from various possible formats
            let errorMessage = 'Failed to create expense';
            if (err.response?.data) {
                const data = err.response.data;
                if (data.detail) {
                    errorMessage = data.detail;
                } else if (data.amount) {
                    errorMessage = Array.isArray(data.amount) ? data.amount[0] : data.amount;
                } else if (data.category) {
                    errorMessage = Array.isArray(data.category) ? data.category[0] : data.category;
                } else if (typeof data === 'string') {
                    errorMessage = data;
                }
            }
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Expense" maxWidth="max-w-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Amount</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <CurrencyDollar size={18} />
                        </div>
                        <input
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            required
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-2xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-300"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700 ml-1">Category</label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <select
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none text-base"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="" disabled>Category</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <Input
                        type="date"
                        label="Date"
                        icon={Calendar}
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>

                <Input
                    label="Note"
                    placeholder="What is this expense for?"
                    icon={FileText}
                    required
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />

                <div className="flex gap-3 pt-2">
                    <Button variant="secondary" className="w-full" onClick={onClose} type="button">
                        Cancel
                    </Button>
                    <Button variant="primary" className="w-full" type="submit" isLoading={isSubmitting}>
                        Save Expense
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddExpenseModal;

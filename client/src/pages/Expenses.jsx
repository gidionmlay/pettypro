import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Search,
    Filter,
    Trash,
    ArrowClockwise
} from 'react-bootstrap-icons';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import AddExpenseModal from '../components/features/AddExpenseModal';
import { expensesApi } from '../api/expenses.api';
import useWebSocket from '../hooks/useWebSocket';

const StatusBadge = ({ status }) => {
    const styles = {
        APPROVED: 'bg-green-50 text-green-700 ring-green-600/20',
        PENDING: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
        REJECTED: 'bg-red-50 text-red-700 ring-red-600/20',
    };

    return (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${styles[status] || styles.PENDING}`}>
            {status}
        </span>
    );
};

const Expenses = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchExpenses = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);

        try {
            const data = await expensesApi.getAll();
            setExpenses(data);
        } catch (error) {
            console.error('Failed to fetch expenses', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Set up WebSocket for real-time updates
    const handleWebSocketMessage = useCallback((newData) => {
        if (newData.expenses) {
            setExpenses(newData.expenses);
        }
    }, []);

    const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://127.0.0.1:8000';
    useWebSocket(`${wsBaseUrl}/ws/dashboard/`, handleWebSocketMessage);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this expense?')) {
            try {
                await expensesApi.delete(id);
                fetchExpenses(true);
            } catch {
                alert('Failed to delete expense');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Loading expenses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
                    <p className="text-gray-500">Manage and track all petty cash expenses</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchExpenses(true)}
                        disabled={refreshing}
                        className={`p-2.5 text-gray-500 hover:text-primary hover:bg-white hover:shadow-sm rounded-xl transition-all ${refreshing ? 'animate-spin-slow' : ''}`}
                        title="Refresh Data"
                    >
                        <ArrowClockwise size={20} />
                    </button>
                    <Button variant="secondary" icon={Filter}>Filter</Button>
                    <Button icon={Plus} onClick={() => setIsModalOpen(true)}>Add Expense</Button>
                </div>
            </div>

            <AddExpenseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => fetchExpenses(true)}
            />

            <Card className="!p-0 overflow-hidden">
                {/* Table Toolbar */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by title, category..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Transaction</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {expenses.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No expenses found</td>
                                </tr>
                            ) : (
                                expenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{expense.note}</div>
                                            <div className="text-xs text-gray-500">Requested by {expense.user_name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {expense.category_name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(expense.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            -${Number(expense.amount).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={expense.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDelete(expense.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Expenses;

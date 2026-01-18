import React, { useState, useEffect, useCallback } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Wallet2,
    CreditCard,
    PiggyBank,
    ArrowClockwise
} from 'react-bootstrap-icons';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import AddExpenseModal from '../components/features/AddExpenseModal';
import { dashboardApi } from '../api/dashboard.api';
import useWebSocket from '../hooks/useWebSocket';

const StatCard = ({ title, amount, trend, icon: StatIcon, gradient }) => {
    const isNegative = trend?.startsWith('-');
    const isPositive = trend?.startsWith('+');
    const isZero = !isNegative && !isPositive;

    // For expenses, positive trend (increase) is usually "bad" (red)
    // For income, positive trend is "good" (green)
    // Here we'll just use red for increase and green for decrease for spending
    const isBad = isPositive;

    return (
        <Card gradient={gradient} hoverable className="flex-1 min-w-[240px]">
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${gradient ? 'bg-white/20 text-white' : 'bg-orange-50 text-primary-dark'}`}>
                    {StatIcon && <StatIcon size={24} />}
                </div>
                {!isZero && (
                    <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg ${isBad ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {isBad ? <ArrowUpRight /> : <ArrowDownRight />}
                        {trend}
                    </div>
                )}
            </div>
            <div className="mt-4">
                <p className={`text-sm font-medium ${gradient ? 'text-white/80' : 'text-gray-500'}`}>{title}</p>
                <h3 className={`text-2xl font-bold mt-1 ${gradient ? 'text-white' : 'text-gray-900'}`}>
                    {typeof amount === 'number' ? `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : amount}
                </h3>
            </div>
        </Card>
    );
};

const Dashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState({
        balance: 0,
        today_expense: 0,
        monthly_expense: 0,
        monthly_income: 0,
        recent_expenses: [],
        chart_data: []
    });

    const fetchData = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);

        try {
            const stats = await dashboardApi.getStats();
            setData(stats);
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Set up WebSocket for real-time updates
    const handleWebSocketMessage = useCallback((newData) => {
        if (newData.dashboard) {
            setData(newData.dashboard);
        }
    }, []);

    const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://127.0.0.1:8000';
    useWebSocket(`${wsBaseUrl}/ws/dashboard/`, handleWebSocketMessage);

    useEffect(() => {
        fetchData();

        // Optional polling every 60 seconds
        const interval = setInterval(() => {
            fetchData(true);
        }, 60000);

        return () => clearInterval(interval);
    }, [fetchData]);


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500">Overview of your petty cash activity</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchData(true)}
                        disabled={refreshing}
                        className={`p-2.5 text-gray-500 hover:text-primary hover:bg-white hover:shadow-sm rounded-xl transition-all ${refreshing ? 'animate-spin-slow' : ''}`}
                        title="Refresh Data"
                    >
                        <ArrowClockwise size={20} />
                    </button>
                    <Button icon={Plus} onClick={() => setIsModalOpen(true)}>Add Expense</Button>
                </div>
            </div>

            <AddExpenseModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                }}
                onSuccess={() => {
                    fetchData(true);
                }}
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <Card className="bg-gradient-to-br from-primary to-primary-dark text-white h-full relative overflow-hidden" hoverable>
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Wallet2 size={120} />
                        </div>
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div>
                                <p className="text-white/80 font-medium mb-1">Total Balance</p>
                                <h2 className="text-4xl font-bold tracking-tight">${Number(data.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                            </div>
                            <div className="mt-8 pt-6 border-t border-white/20 flex justify-between">
                                <div>
                                    <p className="text-white/60 text-sm">Income</p>
                                    <p className="font-semibold mt-1">+${Number(data.monthly_income).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/60 text-sm">Expense</p>
                                    <p className="font-semibold mt-1">-${Number(data.monthly_expense).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <StatCard
                    title="Today's Expenses"
                    amount={Number(data.today_expense)}
                    trend={data.today_trend || '0%'}
                    icon={CreditCard}
                />

                <StatCard
                    title="Monthly Spending"
                    amount={Number(data.monthly_expense)}
                    trend={data.expense_trend || '0%'}
                    icon={PiggyBank}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-900">Weekly Spending</h3>
                            <select className="text-sm border-gray-200 rounded-lg text-gray-500 focus:ring-primary focus:border-primary">
                                <option>This Week</option>
                                <option>Last Week</option>
                            </select>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.chart_data}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} prefix="$" />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#f59e0b"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorAmount)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* Recent Transactions */}
                <div className="lg:col-span-1">
                    <Card className="h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-900">Recent Activity</h3>
                            <Button variant="ghost" size="sm">View All</Button>
                        </div>
                        <div className="space-y-4">
                            {data.recent_expenses.length === 0 ? (
                                <p className="text-gray-400 text-center py-4">No recent activity</p>
                            ) : (
                                data.recent_expenses.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-50 text-orange-600">
                                                <ArrowDownRight />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">{tx.note}</p>
                                                <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className="font-semibold text-gray-900 shrink-0">
                                            -${Math.abs(Number(tx.amount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

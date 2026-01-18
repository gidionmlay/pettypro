import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WalletFill, Envelope, Lock, Person } from 'react-bootstrap-icons';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { authApi } from '../api/auth.api';

const Register = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

    const [error, setError] = useState('');

    const customHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            await authApi.register({
                email: formData.email,
                password: formData.password,
                password1: formData.confirmPassword
            });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.email?.[0] || err.response?.data?.password?.[0] || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 bg-[url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center">
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <Card className="shadow-2xl border-0 !p-8 md:!p-10">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                        <p className="text-gray-500 mt-2">Start tracking your expenses today</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={customHandler} className="space-y-5">
                        <Input
                            id="name"
                            label="Full Name"
                            placeholder="John Doe"
                            icon={Person}
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />

                        <Input
                            id="email"
                            type="email"
                            label="Email Address"
                            placeholder="name@company.com"
                            icon={Envelope}
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />

                        <Input
                            id="password"
                            type="password"
                            label="Password"
                            placeholder="Create a password"
                            icon={Lock}
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />

                        <Input
                            id="confirmPassword"
                            type="password"
                            label="Confirm Password"
                            placeholder="Confirm your password"
                            icon={Lock}
                            required
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />

                        <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
                            Create Account
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-primary hover:text-primary-dark">
                            Sign in here
                        </Link>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default Register;

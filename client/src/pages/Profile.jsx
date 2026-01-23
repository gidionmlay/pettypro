import React, { useState, useRef, useEffect } from 'react';
import { Camera, Person, CheckCircleFill, ExclamationCircleFill } from 'react-bootstrap-icons';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/user.api';

const Profile = () => {
    const { user, loadUser } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user?.profile) {
            setDisplayName(user.profile.display_name || '');
        }
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setStatus({ type: 'error', message: 'Image must be less than 2MB' });
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setStatus({ type: '', message: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const formData = new FormData();
            formData.append('display_name', displayName);
            if (selectedFile) {
                formData.append('avatar', selectedFile);
            }

            await userApi.updateProfile(formData);
            await loadUser(); // Refresh global user state
            setStatus({ type: 'success', message: 'Profile updated successfully!' });
            setSelectedFile(null);
        } catch (error) {
            console.error('Failed to update profile', error);
            setStatus({
                type: 'error',
                message: error.response?.data?.detail || 'Failed to update profile. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const avatarUrl = previewUrl || (user?.profile?.avatar ? `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}${user.profile.avatar}` : null);

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-500">Update your personal information and avatar</p>
            </div>

            <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Avatar Upload Section */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-orange-50 border-4 border-white shadow-md flex items-center justify-center">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <Person size={64} className="text-orange-200" />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Camera size={24} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Click to upload new avatar</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="How others see you"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                            />
                            <p className="mt-1 text-xs text-gray-400 italic">Email cannot be changed.</p>
                        </div>
                    </div>

                    {status.message && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                            {status.type === 'success' ? <CheckCircleFill /> : <ExclamationCircleFill />}
                            <span className="text-sm font-medium">{status.message}</span>
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className="w-full sm:w-auto min-w-[120px]"
                        >
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Profile;

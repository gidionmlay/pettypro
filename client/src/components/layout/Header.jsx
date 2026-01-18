import React from 'react';
import { List, Bell, Search } from 'react-bootstrap-icons';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onMenuClick }) => {
    const { user } = useAuth();

    const getInitials = (user) => {
        if (user?.first_name && user?.last_name) {
            return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
        }
        return (user?.email?.[0] || 'U').toUpperCase();
    };

    const getFullName = (user) => {
        if (user?.first_name || user?.last_name) {
            return `${user.first_name || ''} ${user.last_name || ''}`.trim();
        }
        return user?.email || 'User';
    };

    return (
        <header className="sticky top-0 z-20 px-6 py-4 bg-gray-50/80 backdrop-blur-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 lg:hidden">
                    <button
                        onClick={onMenuClick}
                        className="p-2 -ml-2 text-gray-600 hover:bg-white hover:shadow-sm rounded-xl transition-all"
                    >
                        <List size={24} />
                    </button>
                </div>

                {/* Search Bar - Hidden on mobile for now or made smaller */}
                <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
                    <div className="relative w-full group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search expenses..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                    <button className="p-2.5 text-gray-500 hover:text-primary hover:bg-white hover:shadow-sm rounded-xl transition-all relative">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-gray-50"></span>
                    </button>

                    <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                    <button className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-xl hover:bg-white hover:shadow-sm transition-all group">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center font-medium shadow-md group-hover:scale-105 transition-transform">
                            {getInitials(user)}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-sm font-semibold text-gray-800 leading-none">{getFullName(user)}</p>
                            <p className="text-xs text-gray-500 mt-1">{user?.is_staff ? 'Admin' : 'User'}</p>
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;

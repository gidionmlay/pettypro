import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    GridFill,
    Receipt,
    FileBarGraphFill,
    WalletFill,
    PeopleFill,
    BoxArrowRight,
    X
} from 'react-bootstrap-icons';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const navItems = [
    { path: '/', label: 'Dashboard', icon: GridFill },
    { path: '/expenses', label: 'Expenses', icon: Receipt },
    { path: '/reports', label: 'Reports', icon: FileBarGraphFill },
    { path: '/wallet', label: 'Wallet', icon: WalletFill },
    { path: '/users', label: 'Users', icon: PeopleFill, adminOnly: true },
];

const Sidebar = ({ isOpen, onClose }) => {
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    const sidebarContent = (
        <div className="flex flex-col h-full bg-white border-r border-gray-100">
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-primary-dark shadow-sm">
                        <WalletFill className="text-xl" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-secondary">
                        Petty<span className="text-primary">Pro</span>
                    </span>
                </div>
                <button onClick={onClose} className="lg:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-lg">
                    <X size={24} />
                </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => window.innerWidth < 1024 && onClose()}
                        className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
              ${isActive
                                ? 'bg-primary/10 text-primary-dark shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-secondary'}
            `}
                    >
                        <item.icon size={18} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium"
                >
                    <BoxArrowRight size={18} />
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 h-screen sticky top-0 z-30">
                {sidebarContent}
            </aside>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden shadow-2xl"
                        >
                            {sidebarContent}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;

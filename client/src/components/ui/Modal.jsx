import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'react-bootstrap-icons';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="relative z-50">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                    />

                    {/* Modal Content */}
                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ duration: 0.2 }}
                                className={`
                  relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full
                  ${maxWidth}
                `}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                                    <button
                                        onClick={onClose}
                                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-500 transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="px-6 py-6">
                                    {children}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;

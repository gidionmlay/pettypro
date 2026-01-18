import React from 'react';
import { motion } from 'framer-motion';

const variants = {
    primary: 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg hover:shadow-glow hover:brightness-110',
    secondary: 'bg-white text-secondary border border-gray-200 hover:border-primary hover:text-primary shadow-sm',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100',
    ghost: 'bg-transparent text-gray-500 hover:text-secondary hover:bg-gray-50',
};

const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg font-semibold',
};

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    isLoading = false,
    onClick,
    type = 'button',
    icon: Icon,
    disabled = false
}) => {
    return (
        <motion.button
            whileHover={!disabled && !isLoading ? { scale: 1.02, y: -1 } : {}}
            whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
            initial={false}
            type={type}
            onClick={!disabled && !isLoading ? onClick : undefined}
            disabled={disabled || isLoading}
            className={`
        relative inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${disabled || isLoading ? 'opacity-60 cursor-not-allowed grayscale' : ''}
        ${className}
      `}
        >
            {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : Icon ? (
                <Icon className={`mr-2 ${size === 'sm' ? 'text-sm' : 'text-lg'}`} />
            ) : null}
            {children}
        </motion.button>
    );
};

export default Button;

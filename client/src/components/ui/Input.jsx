import React from 'react';

const Input = ({
    label,
    id,
    type = 'text',
    placeholder,
    error,
    icon: Icon,
    className = '',
    ...props
}) => {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-gray-700 ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    className={`
            w-full rounded-xl border px-4 py-2.5 text-base transition-colors
            focus:outline-none focus:ring-2 focus:ring-primary/20 
            disabled:bg-gray-50 disabled:text-gray-500
            ${Icon ? 'pl-10' : ''}
            ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50/50'
                            : 'border-gray-200 hover:border-gray-300 focus:border-primary'}
          `}
                    {...props}
                />
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <Icon size={18} />
                    </div>
                )}
            </div>
            {error && (
                <span className="text-xs text-red-500 ml-1 font-medium">{error}</span>
            )}
        </div>
    );
};

export default Input;

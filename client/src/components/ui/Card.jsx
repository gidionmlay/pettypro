import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
    children,
    className = '',
    hoverable = false,
    gradient = false,
    onClick
}) => {
    const hoverProps = hoverable ? {
        whileHover: { y: -5, transition: { duration: 0.2 } },
        initial: { y: 0 }
    } : {};

    return (
        <motion.div
            {...hoverProps}
            onClick={onClick}
            className={`
        relative bg-white rounded-2xl p-6
        ${gradient ? 'bg-gradient-to-br from-white to-orange-50/30' : ''}
        ${hoverable ? 'hover:shadow-glow cursor-pointer' : ''}
        shadow-soft border border-gray-100
        ${className}
      `}
        >
            {gradient && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full rounded-tr-2xl pointer-events-none" />
            )}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};

export default Card;

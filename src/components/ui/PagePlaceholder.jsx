import React from 'react';

const PagePlaceholder = ({ title }) => (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-secondary">{title}</h1>
        <div className="p-12 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-400">
            Work in progress
        </div>
    </div>
);

export default PagePlaceholder;

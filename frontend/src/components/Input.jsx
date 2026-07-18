import React, { useState } from 'react';

const Input = ({ label, id, error, type: initialType = 'text', ...props }) => {
    const isPassword = initialType === 'password';
    const [showPassword, setShowPassword] = useState(false);
    const type = isPassword && showPassword ? 'text' : initialType;

    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={type}
                    className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500' : 'border-gray-300'} ${isPassword ? 'pr-10' : ''}`}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm font-medium"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? 'Hide' : 'Show'}
                    </button>
                )}
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
};

export default Input;

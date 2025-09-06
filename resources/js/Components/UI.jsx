import React from 'react';

export function FormLabel({ className = '', children, ...props }) {
    return (
        <label
            {...props}
            className={`block font-medium text-sm text-gray-700 ` + className}
        >
            {children}
        </label>
    );
}

export function FormInput({ type = 'text', className = '', ...props }) {
    return (
        <input
            {...props}
            type={type}
            className={
                `border-gray-300 bg-white text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm ` +
                className
            }
        />
    );
}

export function FormSelect({ className = '', children, ...props }) {
    return (
        <select
            {...props}
            className={
                `border-gray-300 bg-white text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm ` +
                className
            }
        >
            {children}
        </select>
    );
}

export function FormTextarea({ className = '', ...props }) {
    return (
        <textarea
            {...props}
            className={
                `border-gray-300 bg-white text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm ` +
                className
            }
        />
    );
}

export function Button({ className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}

export function Card({ className = '', children, ...props }) {
    return (
        <div
            {...props}
            className={
                `bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 ` +
                className
            }
        >
            {children}
        </div>
    );
}

export function PageHeader({ title, subtitle, actions, children }) {
    return (
        <div className="flex justify-between items-start">
            <div>
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {title || children}
                </h2>
                {subtitle && (
                    <p className="mt-1 text-sm text-gray-600">
                        {subtitle}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex-shrink-0">
                    {actions}
                </div>
            )}
        </div>
    );
}

export function Dropdown({ trigger, children }) {
    const [open, setOpen] = React.useState(false);

    const handleClickOutside = React.useCallback((event) => {
        if (open && !event.target.closest('.dropdown-content') && !event.target.closest('.dropdown-trigger')) {
            setOpen(false);
        }
    }, [open]);

    React.useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [handleClickOutside]);

    return (
        <div className="relative">
            <div 
                className="dropdown-trigger cursor-pointer" 
                onClick={() => setOpen(!open)}
            >
                {trigger}
            </div>

            {open && (
                <div className="dropdown-content absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    {children}
                </div>
            )}
        </div>
    );
}

export function DropdownButton({ onClick, children, className = '' }) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${className}`}
        >
            {children}
        </button>
    );
}

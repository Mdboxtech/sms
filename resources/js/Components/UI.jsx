import React from 'react';

export function FormLabel({ className = '', children, ...props }) {
    return (
        <label
            {...props}
            className={`block font-medium text-sm text-gray-700 dark:text-gray-300 ` + className}
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
                `border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm ` +
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
                `border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm ` +
                className
            }
        >
            {children}
        </select>
    );
}

export function Button({ className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center px-4 py-2 bg-gray-800 dark:bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-white dark:text-gray-800 uppercase tracking-widest hover:bg-gray-700 dark:hover:bg-white focus:bg-gray-700 dark:focus:bg-white active:bg-gray-900 dark:active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150 ${
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
                `bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 ` +
                className
            }
        >
            {children}
        </div>
    );
}

export function PageHeader({ children }) {
    return (
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {children}
        </h2>
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
                <div className="dropdown-content absolute right-0 mt-2 py-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
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
            className={`w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
        >
            {children}
        </button>
    );
}

import React from 'react';

export function Checkbox({ className = '', checked, onCheckedChange, ...props }) {
    return (
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${className}`}
            {...props}
        />
    );
}

export default Checkbox;

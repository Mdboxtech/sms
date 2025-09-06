import React from 'react';

export function Separator({ className = '', orientation = 'horizontal', ...props }) {
    return (
        <div
            className={`${
                orientation === 'horizontal' 
                    ? 'h-px w-full bg-border' 
                    : 'w-px h-full bg-border'
            } ${className}`}
            {...props}
        />
    );
}

export default Separator;

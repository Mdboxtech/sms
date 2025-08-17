import { forwardRef } from 'react';

const SelectInput = forwardRef(({ className = '', children, ...props }, ref) => {
    return (
        <select
            {...props}
            ref={ref}
            className={
                'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm ' +
                className
            }
        >
            {children}
        </select>
    );
});

SelectInput.displayName = 'SelectInput';

export default SelectInput;

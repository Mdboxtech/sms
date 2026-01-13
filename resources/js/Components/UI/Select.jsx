export default function Select({ className = '', ...props }) {
    return (
        <select
            {...props}
            className={
                'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary dark:bg-gray-800 dark:text-gray-100 rounded-md shadow-sm ' +
                className
            }
        >
            {props.children}
        </select>
    );
}

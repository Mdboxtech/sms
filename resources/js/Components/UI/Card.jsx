export default function Card({ className = '', children }) {
    return (
        <div className={`bg-white border border-gray-200 shadow-sm sm:rounded-lg ${className}`}>
            <div className="p-6 text-gray-900">
                {children}
            </div>
        </div>
    );
}

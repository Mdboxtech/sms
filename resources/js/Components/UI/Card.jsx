export default function Card({ className = '', children }) {
    return (
        <div className={`bg-white overflow-hidden shadow-sm sm:rounded-lg ${className}`}>
            <div className="p-6">
                {children}
            </div>
        </div>
    );
}

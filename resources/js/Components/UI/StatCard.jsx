export default function StatCard({ title, value, icon: Icon, trend = null, className = '' }) {
    return (
        <div className={`bg-white overflow-hidden shadow-sm sm:rounded-lg ${className}`}>
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
                        {trend && (
                            <div className="mt-2">
                                <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                                </span>
                                <span className="text-sm font-medium text-gray-600"> vs last term</span>
                            </div>
                        )}
                    </div>
                    {Icon && (
                        <div className="p-3 bg-indigo-50 rounded-full">
                            <Icon className="w-6 h-6 text-indigo-600" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

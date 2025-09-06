import Card from './Card';
import StatCard from './StatCard';
import Table from './Table';
import Select from './Select';

// PageHeader component for consistent page headers
function PageHeader({ title, subtitle, actions }) {
    return (
        <div className="bg-white border-b border-gray-200">
            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold leading-tight text-gray-900">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="mt-1 text-sm text-gray-600">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {actions && (
                        <div className="flex items-center space-x-4">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export { Card, StatCard, Table, Select, PageHeader };

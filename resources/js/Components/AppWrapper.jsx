import { usePage } from '@inertiajs/react';
import ThemeProvider from '@/Components/ThemeProvider';

export default function AppWrapper({ children }) {
    const { themeSettings } = usePage().props;

    return (
        <ThemeProvider themeSettings={themeSettings}>
            {children}
        </ThemeProvider>
    );
}

import { usePage } from '@inertiajs/react';
import ThemeProvider from '@/Components/ThemeProvider';

export default function AppWrapper({ children }) {
    const { props } = usePage();
    const themeSettings = props.themeSettings || {};

    return (
        <ThemeProvider themeSettings={themeSettings}>
            {children}
        </ThemeProvider>
    );
}

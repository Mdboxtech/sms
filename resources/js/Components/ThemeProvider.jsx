import { useEffect, useState, createContext, useContext } from 'react';

// Create a context for dark mode
export const ThemeContext = createContext({
    isDarkMode: false,
    toggleDarkMode: () => { },
    themeSettings: {}
});

// Hook to use theme context
export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children, themeSettings }) {
    // Initialize dark mode from localStorage
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('darkMode');
            return saved === 'true';
        }
        return false;
    });

    // Toggle dark mode
    const toggleDarkMode = () => {
        setIsDarkMode(prev => {
            const newValue = !prev;
            localStorage.setItem('darkMode', String(newValue));
            return newValue;
        });
    };

    useEffect(() => {
        // Create or update CSS custom properties
        const root = document.documentElement;

        // Set CSS custom properties for theme colors
        const primaryStart = themeSettings?.primary_start || '#6366f1';
        const primaryEnd = themeSettings?.primary_end || '#8b5cf6';
        const secondaryStart = themeSettings?.secondary_start || '#ec4899';
        const secondaryEnd = themeSettings?.secondary_end || '#f59e0b';
        const accentColor = themeSettings?.accent_color || '#10b981';
        const backgroundStart = themeSettings?.background_start || '#f8fafc';
        const backgroundEnd = themeSettings?.background_end || '#e2e8f0';

        root.style.setProperty('--theme-primary-start', primaryStart);
        root.style.setProperty('--theme-primary-end', primaryEnd);
        root.style.setProperty('--theme-secondary-start', secondaryStart);
        root.style.setProperty('--theme-secondary-end', secondaryEnd);
        root.style.setProperty('--theme-accent-color', accentColor);
        root.style.setProperty('--theme-background-start', backgroundStart);
        root.style.setProperty('--theme-background-end', backgroundEnd);

        // Set gradient CSS custom properties
        root.style.setProperty('--theme-primary-gradient', `linear-gradient(135deg, ${primaryStart}, ${primaryEnd})`);
        root.style.setProperty('--theme-secondary-gradient', `linear-gradient(135deg, ${secondaryStart}, ${secondaryEnd})`);
        root.style.setProperty('--theme-background-gradient', `linear-gradient(135deg, ${backgroundStart}, ${backgroundEnd})`);

        // Handle dark mode class on document
        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Create dynamic styles for common elements
        const styleId = 'dynamic-theme-styles';
        let styleElement = document.getElementById(styleId);

        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }

        const buttonStyle = themeSettings?.button_style || 'gradient';

        // Generate CSS based on current theme settings
        const dynamicCSS = `
            :root {
                --theme-primary-start: ${primaryStart};
                --theme-primary-end: ${primaryEnd};
                --theme-secondary-start: ${secondaryStart};
                --theme-secondary-end: ${secondaryEnd};
                --theme-accent-color: ${accentColor};
                --theme-background-start: ${backgroundStart};
                --theme-background-end: ${backgroundEnd};
                --theme-primary-gradient: linear-gradient(135deg, ${primaryStart}, ${primaryEnd});
                --theme-secondary-gradient: linear-gradient(135deg, ${secondaryStart}, ${secondaryEnd});
                --theme-background-gradient: linear-gradient(135deg, ${backgroundStart}, ${backgroundEnd});
            }
            
            /* ========== DARK MODE STYLES ========== */
            
            /* Root and body */
            .dark {
                color-scheme: dark;
            }
            
            .dark body {
                background-color: #0f172a !important;
                color: #e2e8f0 !important;
            }
            
            /* Main layout container */
            .dark .bg-gray-100 {
                background-color: #0f172a !important;
            }
            
            /* Sidebar */
            .dark .border-r {
                border-color: #334155 !important;
            }
            
            .dark [class*="bg-white"],
            .dark .bg-white {
                background-color: #1e293b !important;
            }
            
            .dark .bg-white\\/70 {
                background-color: rgba(30, 41, 59, 0.7) !important;
            }
            
            /* Cards and panels */
            .dark .bg-gray-50 {
                background-color: #1e293b !important;
            }
            
            .dark .rounded-xl.shadow-lg,
            .dark .rounded-2xl.shadow,
            .dark [class*="shadow-lg"] {
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2) !important;
            }
            
            /* Text colors */
            .dark .text-gray-900 {
                color: #f1f5f9 !important;
            }
            
            .dark .text-gray-800 {
                color: #e2e8f0 !important;
            }
            
            .dark .text-gray-700 {
                color: #cbd5e1 !important;
            }
            
            .dark .text-gray-600 {
                color: #94a3b8 !important;
            }
            
            .dark .text-gray-500 {
                color: #64748b !important;
            }
            
            .dark .text-gray-400 {
                color: #64748b !important;
            }
            
            /* Borders */
            .dark .border-gray-200,
            .dark .border-gray-300 {
                border-color: #334155 !important;
            }
            
            .dark .border-gray-100 {
                border-color: #1e293b !important;
            }
            
            .dark .border-gray-200\\/50 {
                border-color: rgba(51, 65, 85, 0.5) !important;
            }
            
            /* Input fields */
            .dark input,
            .dark select,
            .dark textarea {
                background-color: #1e293b !important;
                border-color: #475569 !important;
                color: #e2e8f0 !important;
            }
            
            .dark input::placeholder,
            .dark textarea::placeholder {
                color: #64748b !important;
            }
            
            .dark input:focus,
            .dark select:focus,
            .dark textarea:focus {
                border-color: ${primaryStart} !important;
                box-shadow: 0 0 0 3px ${primaryStart}30 !important;
            }
            
            /* Headers and sections */
            .dark header,
            .dark .sticky {
                background-color: rgba(15, 23, 42, 0.9) !important;
                backdrop-filter: blur(16px) !important;
            }
            
            /* Dropdowns and menus */
            .dark [class*="Menu.Items"],
            .dark .absolute.right-0.mt-2 {
                background-color: #1e293b !important;
                border-color: #334155 !important;
            }
            
            /* Hover states */
            .dark .hover\\:bg-gray-100:hover,
            .dark .hover\\:bg-gray-50:hover {
                background-color: #334155 !important;
            }
            
            /* Filter and gradient backgrounds */
            .dark .from-gray-50,
            .dark .to-indigo-50 {
                --tw-gradient-from: #1e293b !important;
                --tw-gradient-to: #1e293b !important;
            }
            
            .dark .bg-gradient-to-r.from-gray-50 {
                background: #1e293b !important;
            }
            
            .dark .bg-gradient-to-b.from-transparent.to-white\\/30 {
                background: linear-gradient(to bottom, transparent, rgba(30, 41, 59, 0.3)) !important;
            }
            
            /* Stats cards */
            .dark .bg-blue-50,
            .dark .bg-green-50,
            .dark .bg-yellow-50,
            .dark .bg-red-50,
            .dark .bg-purple-50,
            .dark .bg-orange-50,
            .dark .bg-pink-50 {
                background-color: rgba(30, 41, 59, 0.8) !important;
            }
            
            /* Ring and focus colors - use theme */
            .dark .focus\\:ring-indigo-500:focus {
                --tw-ring-color: ${primaryStart} !important;
            }
            
            /* Badge colors in dark mode */
            .dark .bg-red-500 {
                background-color: #ef4444 !important;
            }
            
            .dark .bg-green-500 {
                background-color: #22c55e !important;
            }
            
            /* ========== THEME COLOR OVERRIDES ========== */
            
            /* Primary buttons */
            .btn-primary {
                ${buttonStyle === 'gradient'
                ? `background: var(--theme-primary-gradient) !important;`
                : buttonStyle === 'solid'
                    ? `background-color: var(--theme-primary-start) !important;`
                    : `background: transparent !important; border: 2px solid var(--theme-primary-start) !important; color: var(--theme-primary-start) !important;`
            }
                color: ${buttonStyle === 'outline' ? 'var(--theme-primary-start)' : 'white'} !important;
            }
            
            /* Secondary buttons */
            .btn-secondary {
                ${buttonStyle === 'gradient'
                ? `background: var(--theme-secondary-gradient) !important;`
                : buttonStyle === 'solid'
                    ? `background-color: var(--theme-secondary-start) !important;`
                    : `background: transparent !important; border: 2px solid var(--theme-secondary-start) !important; color: var(--theme-secondary-start) !important;`
            }
                color: ${buttonStyle === 'outline' ? 'var(--theme-secondary-start)' : 'white'} !important;
            }
            
            /* Override indigo colors with theme primary */
            .text-indigo-600,
            .text-indigo-700 {
                color: ${primaryStart} !important;
            }
            
            .bg-indigo-50 {
                background-color: ${primaryStart}15 !important;
            }
            
            .bg-indigo-100 {
                background-color: ${primaryStart}20 !important;
            }
            
            .bg-indigo-500,
            .bg-indigo-600 {
                background-color: ${primaryStart} !important;
            }
            
            .border-indigo-500 {
                border-color: ${primaryStart} !important;
            }
            
            .hover\\:text-indigo-600:hover {
                color: ${primaryStart} !important;
            }
            
            .hover\\:bg-indigo-100:hover {
                background-color: ${primaryStart}20 !important;
            }
            
            /* Override purple colors with theme primary end */
            .from-indigo-500,
            .from-indigo-600 {
                --tw-gradient-from: ${primaryStart} !important;
            }
            
            .to-purple-600,
            .to-purple-500 {
                --tw-gradient-to: ${primaryEnd} !important;
            }
            
            .from-purple-500 {
                --tw-gradient-from: ${primaryEnd} !important;
            }
            
            /* Gradient backgrounds */
            .bg-gradient-to-br.from-indigo-500.to-purple-600,
            .bg-gradient-to-br.from-indigo-400.to-purple-600 {
                background: linear-gradient(135deg, ${primaryStart}, ${primaryEnd}) !important;
            }
            
            /* Focus ring using theme color */
            .focus\\:ring-indigo-500:focus {
                --tw-ring-color: ${primaryStart} !important;
            }
            
            /* ========== UTILITY CLASSES ========== */
            
            /* Accent elements */
            .accent-color {
                color: var(--theme-accent-color) !important;
            }
            
            .accent-bg {
                background-color: var(--theme-accent-color) !important;
            }
            
            /* Links */
            .link-primary {
                color: var(--theme-primary-start) !important;
            }
            
            .link-primary:hover {
                color: var(--theme-primary-end) !important;
            }
            
            /* Progress bars */
            .progress-primary {
                background: var(--theme-primary-gradient) !important;
            }
            
            /* Badges */
            .badge-primary {
                background: var(--theme-primary-gradient) !important;
                color: white !important;
            }
            
            .badge-secondary {
                background: var(--theme-secondary-gradient) !important;
                color: white !important;
            }
            
            /* Focus rings */
            .focus-primary:focus {
                box-shadow: 0 0 0 3px ${primaryStart}40 !important;
                border-color: var(--theme-primary-start) !important;
            }
            
            /* Background utilities */
            .bg-theme-gradient {
                background: var(--theme-background-gradient) !important;
            }
            
            .bg-primary-gradient {
                background: var(--theme-primary-gradient) !important;
            }
            
            .bg-secondary-gradient {
                background: var(--theme-secondary-gradient) !important;
            }
            
            /* Text utilities */
            .text-primary {
                color: var(--theme-primary-start) !important;
            }
            
            .text-secondary {
                color: var(--theme-secondary-start) !important;
            }
            
            .text-accent {
                color: var(--theme-accent-color) !important;
            }
            
            /* Border utilities */
            .border-primary {
                border-color: var(--theme-primary-start) !important;
            }
            
            .border-secondary {
                border-color: var(--theme-secondary-start) !important;
            }
            
            /* Ring utilities */
            .ring-primary {
                --tw-ring-color: var(--theme-primary-start) !important;
            }
            
            .ring-secondary {
                --tw-ring-color: var(--theme-secondary-start) !important;
            }
        `;

        styleElement.textContent = dynamicCSS;

    }, [themeSettings, isDarkMode]);

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, themeSettings }}>
            {children}
        </ThemeContext.Provider>
    );
}

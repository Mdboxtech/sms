import { useEffect } from 'react';

export default function ThemeProvider({ children, themeSettings }) {

    useEffect(() => {
        if (!themeSettings) return;

        // Create or update CSS custom properties
        const root = document.documentElement;
        
        // Set CSS custom properties for theme colors
        root.style.setProperty('--theme-primary-start', themeSettings.primary_start || '#6366f1');
        root.style.setProperty('--theme-primary-end', themeSettings.primary_end || '#8b5cf6');
        root.style.setProperty('--theme-secondary-start', themeSettings.secondary_start || '#ec4899');
        root.style.setProperty('--theme-secondary-end', themeSettings.secondary_end || '#f59e0b');
        root.style.setProperty('--theme-accent-color', themeSettings.accent_color || '#10b981');
        root.style.setProperty('--theme-background-start', themeSettings.background_start || '#f8fafc');
        root.style.setProperty('--theme-background-end', themeSettings.background_end || '#e2e8f0');
        
        // Set gradient CSS custom properties
        root.style.setProperty('--theme-primary-gradient', `linear-gradient(135deg, ${themeSettings.primary_start || '#6366f1'}, ${themeSettings.primary_end || '#8b5cf6'})`);
        root.style.setProperty('--theme-secondary-gradient', `linear-gradient(135deg, ${themeSettings.secondary_start || '#ec4899'}, ${themeSettings.secondary_end || '#f59e0b'})`);
        root.style.setProperty('--theme-background-gradient', `linear-gradient(135deg, ${themeSettings.background_start || '#f8fafc'}, ${themeSettings.background_end || '#e2e8f0'})`);

        // Create dynamic styles for common elements
        const styleId = 'dynamic-theme-styles';
        let styleElement = document.getElementById(styleId);
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }

        const buttonStyle = themeSettings.button_style || 'gradient';
        
        // Generate CSS based on current theme settings
        const dynamicCSS = `
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
                box-shadow: 0 0 0 3px ${themeSettings.primary_start || '#6366f1'}40 !important;
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

    }, [themeSettings]);

    return children;
}

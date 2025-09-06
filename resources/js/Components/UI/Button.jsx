import { usePage } from '@inertiajs/react';

export default function Button({ 
    children, 
    type = 'button', 
    variant = 'primary', 
    size = 'md', 
    disabled = false, 
    className = '', 
    onClick,
    as: Component = 'button',
    ...props 
}) {
    const { themeSettings } = usePage().props;
    
    // Get dynamic theme colors
    const primaryGradient = `linear-gradient(135deg, ${themeSettings?.primary_start || '#6366f1'}, ${themeSettings?.primary_end || '#8b5cf6'})`;
    const secondaryGradient = `linear-gradient(135deg, ${themeSettings?.secondary_start || '#ec4899'}, ${themeSettings?.secondary_end || '#f59e0b'})`;
    const buttonStyle = themeSettings?.button_style || 'gradient';
    
    // Get base classes
    const baseClasses = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none';
    
    // Size classes
    const sizeClasses = {
        xs: 'px-2 py-1 text-xs',
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        xl: 'px-8 py-4 text-lg'
    };
    
    // Get variant styling
    const getVariantStyle = (variant) => {
        const styles = {
            primary: {
                gradient: {
                    style: { background: primaryGradient },
                    classes: 'text-white shadow-lg hover:shadow-xl',
                    focusRing: 'focus:ring-indigo-500'
                },
                solid: {
                    style: { backgroundColor: themeSettings?.primary_start || '#6366f1' },
                    classes: 'text-white shadow-lg hover:shadow-xl',
                    focusRing: 'focus:ring-indigo-500'
                },
                outline: {
                    style: { 
                        border: `2px solid ${themeSettings?.primary_start || '#6366f1'}`,
                        color: themeSettings?.primary_start || '#6366f1'
                    },
                    classes: 'bg-transparent hover:bg-opacity-10',
                    focusRing: 'focus:ring-indigo-500'
                }
            },
            secondary: {
                gradient: {
                    style: { background: secondaryGradient },
                    classes: 'text-white shadow-lg hover:shadow-xl',
                    focusRing: 'focus:ring-pink-500'
                },
                solid: {
                    style: { backgroundColor: themeSettings?.secondary_start || '#ec4899' },
                    classes: 'text-white shadow-lg hover:shadow-xl',
                    focusRing: 'focus:ring-pink-500'
                },
                outline: {
                    style: { 
                        border: `2px solid ${themeSettings?.secondary_start || '#ec4899'}`,
                        color: themeSettings?.secondary_start || '#ec4899'
                    },
                    classes: 'bg-transparent hover:bg-opacity-10',
                    focusRing: 'focus:ring-pink-500'
                }
            },
            success: {
                gradient: {
                    style: { background: `linear-gradient(135deg, ${themeSettings?.accent_color || '#10b981'}, #059669)` },
                    classes: 'text-white shadow-lg hover:shadow-xl',
                    focusRing: 'focus:ring-emerald-500'
                },
                solid: {
                    style: { backgroundColor: themeSettings?.accent_color || '#10b981' },
                    classes: 'text-white shadow-lg hover:shadow-xl',
                    focusRing: 'focus:ring-emerald-500'
                },
                outline: {
                    style: { 
                        border: `2px solid ${themeSettings?.accent_color || '#10b981'}`,
                        color: themeSettings?.accent_color || '#10b981'
                    },
                    classes: 'bg-transparent hover:bg-opacity-10',
                    focusRing: 'focus:ring-emerald-500'
                }
            },
            danger: {
                gradient: {
                    style: { background: 'linear-gradient(135deg, #ef4444, #dc2626)' },
                    classes: 'text-white shadow-lg hover:shadow-xl',
                    focusRing: 'focus:ring-red-500'
                },
                solid: {
                    style: { backgroundColor: '#ef4444' },
                    classes: 'text-white shadow-lg hover:shadow-xl',
                    focusRing: 'focus:ring-red-500'
                },
                outline: {
                    style: { 
                        border: '2px solid #ef4444',
                        color: '#ef4444'
                    },
                    classes: 'bg-transparent hover:bg-opacity-10',
                    focusRing: 'focus:ring-red-500'
                }
            },
            white: {
                gradient: {
                    style: { background: 'linear-gradient(135deg, #ffffff, #f8fafc)' },
                    classes: 'text-gray-700 shadow-lg hover:shadow-xl border border-gray-300',
                    focusRing: 'focus:ring-gray-500'
                },
                solid: {
                    style: { backgroundColor: '#ffffff' },
                    classes: 'text-gray-700 shadow-lg hover:shadow-xl border border-gray-300',
                    focusRing: 'focus:ring-gray-500'
                },
                outline: {
                    style: { 
                        border: '2px solid #ffffff',
                        color: '#ffffff'
                    },
                    classes: 'bg-transparent hover:bg-white hover:bg-opacity-10',
                    focusRing: 'focus:ring-white'
                }
            }
        };
        
        return styles[variant]?.[buttonStyle] || styles.primary.gradient;
    };
    
    const variantStyle = getVariantStyle(variant);
    
    // Determine props based on component type
    const componentProps = {
        className: `${baseClasses} ${sizeClasses[size]} ${variantStyle.classes} ${variantStyle.focusRing} ${className}`,
        style: variantStyle.style,
        ...props
    };
    
    // Add button-specific props only if rendering as button
    if (Component === 'button') {
        componentProps.type = type;
        componentProps.disabled = disabled;
        componentProps.onClick = onClick;
    }
    
    return (
        <Component
            {...componentProps}
        >
            {children}
        </Component>
    );
}

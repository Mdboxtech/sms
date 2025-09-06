import React from 'react';

const Alert = React.forwardRef(({ className = '', variant = 'default', ...props }, ref) => {
  const variants = {
    default: "bg-background text-foreground border-border",
    destructive: "border-red-200 bg-red-50 text-red-900",
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={`relative w-full rounded-lg border p-4 ${variants[variant]} ${className}`}
      {...props}
    />
  );
});
Alert.displayName = "Alert";

const AlertDescription = React.forwardRef(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm leading-relaxed ${className}`}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

const AlertTitle = React.forwardRef(({ className = '', ...props }, ref) => (
  <h5
    ref={ref}
    className={`mb-1 font-medium leading-none tracking-tight ${className}`}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

export { Alert, AlertDescription, AlertTitle };

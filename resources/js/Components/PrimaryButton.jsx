import Button from '@/Components/UI/Button';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <Button
            variant="primary"
            disabled={disabled}
            className={className}
            {...props}
        >
            {children}
        </Button>
    );
}

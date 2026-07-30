import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background)] disabled:opacity-50 disabled:cursor-not-allowed transform';

  const variantStyles = {
    primary:
      'bg-[var(--btn-primary)] text-black font-bold hover:bg-[var(--btn-primary-hover)] focus:ring-[var(--btn-primary)] shadow-[0_0_15px_#76b9004d] hover:shadow-[0_0_20px_#76b90066] hover:scale-[1.02]',
    secondary:
      'bg-[var(--btn-primary)] text-black font-bold hover:bg-[var(--btn-primary-hover)] focus:ring-[var(--btn-primary)] shadow-[0_0_15px_#76b9004d] hover:shadow-[0_0_20px_#76b90066] hover:scale-[1.02]',
    outline:
      'bg-[var(--btn-primary)] text-black font-bold border border-[var(--btn-primary)] hover:bg-[var(--btn-primary-hover)] focus:ring-[var(--btn-primary)] shadow-[0_0_15px_#76b9004d] hover:scale-[1.02]',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};

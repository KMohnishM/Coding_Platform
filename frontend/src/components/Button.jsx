import React from 'react';

/**
 * Button component for the application
 * 
 * @param {object} props - The component props
 * @param {string} [props.type='button'] - The button type (button, submit, reset)
 * @param {string} [props.variant='primary'] - The button variant (primary, secondary, outline, danger)
 * @param {boolean} [props.isFullWidth=false] - Whether the button should take full width
 * @param {boolean} [props.isLoading=false] - Whether the button is in a loading state
 * @param {boolean} [props.isDisabled=false] - Whether the button is disabled
 * @param {string} [props.size='md'] - The button size (sm, md, lg)
 * @param {function} [props.onClick] - The click handler function
 * @param {React.ReactNode} props.children - The button content
 * @returns {JSX.Element} - The button component
 */
const Button = ({
  type = 'button',
  variant = 'primary',
  isFullWidth = false,
  isLoading = false,
  isDisabled = false,
  size = 'md',
  onClick,
  children,
  className = '',
  ...rest
}) => {
  // Button size classes
  const sizeClasses = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-2.5 px-5 text-lg',
  };

  // Button variant classes
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-600',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white border border-gray-600',
    outline: 'bg-transparent hover:bg-gray-100 text-blue-600 border border-blue-600',
    danger: 'bg-red-600 hover:bg-red-700 text-white border border-red-600',
  };

  // Base button classes
  const baseClasses = 'transition-colors duration-200 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed';
  
  // Full width class
  const fullWidthClass = isFullWidth ? 'w-full' : '';

  const selectedVariantClass = variantClasses[variant] || variantClasses.primary;

  // Button class composition
  const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${selectedVariantClass} ${fullWidthClass} ${className}`;

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {children}
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
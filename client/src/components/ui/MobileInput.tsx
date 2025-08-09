import React from 'react';

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  fullWidth?: boolean;
}

/**
 * Input optimisé pour mobile avec styles cohérents
 */
const MobileInput: React.FC<MobileInputProps> = ({
  error = false,
  fullWidth = true,
  className = '',
  ...props
}) => {
  return (
    <input
      {...props}
      className={`
        ${fullWidth ? 'w-full' : ''}
        px-4 py-3
        text-base
        border-2 rounded-lg
        transition-all duration-200
        placeholder:text-gray-400
        focus:outline-none
        focus:ring-4 focus:ring-blue-100
        ${error 
          ? 'border-red-300 focus:border-red-500' 
          : 'border-gray-300 focus:border-blue-500'
        }
        ${className}
      `}
    />
  );
};

interface MobileSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  fullWidth?: boolean;
}

/**
 * Select optimisé pour mobile avec styles cohérents
 */
export const MobileSelect: React.FC<MobileSelectProps> = ({
  error = false,
  fullWidth = true,
  className = '',
  children,
  ...props
}) => {
  return (
    <select
      {...props}
      className={`
        ${fullWidth ? 'w-full' : ''}
        px-4 py-3
        text-base
        border-2 rounded-lg
        transition-all duration-200
        focus:outline-none
        focus:ring-4 focus:ring-blue-100
        ${error 
          ? 'border-red-300 focus:border-red-500' 
          : 'border-gray-300 focus:border-blue-500'
        }
        ${className}
      `}
    >
      {children}
    </select>
  );
};

interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  fullWidth?: boolean;
}

/**
 * Textarea optimisé pour mobile avec styles cohérents
 */
export const MobileTextarea: React.FC<MobileTextareaProps> = ({
  error = false,
  fullWidth = true,
  className = '',
  ...props
}) => {
  return (
    <textarea
      {...props}
      className={`
        ${fullWidth ? 'w-full' : ''}
        px-4 py-3
        text-base
        border-2 rounded-lg
        transition-all duration-200
        placeholder:text-gray-400
        focus:outline-none
        focus:ring-4 focus:ring-blue-100
        resize-y
        ${error 
          ? 'border-red-300 focus:border-red-500' 
          : 'border-gray-300 focus:border-blue-500'
        }
        ${className}
      `}
    />
  );
};

export default MobileInput;
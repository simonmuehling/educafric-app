import React from 'react';

interface MobileFormFieldProps {
  label: string;
  icon?: React.ReactNode;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Champ de formulaire optimisé mobile avec design cohérent
 */
const MobileFormField: React.FC<MobileFormFieldProps> = ({
  label,
  icon,
  required = false,
  error,
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {icon}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        {children}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <span className="w-4 h-4">⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
};

export default MobileFormField;
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: z.ZodType<any>;
  options?: { value: string; label: string }[];
  description?: string;
  defaultValue?: any;
  disabled?: boolean;
  className?: string;
}

interface FormBuilderProps {
  fields: FormField[];
  onSubmit: (data: any) => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
  layout?: 'vertical' | 'horizontal';
  columns?: 1 | 2 | 3;
}

export function FormBuilder({
  fields,
  onSubmit,
  submitLabel,
  cancelLabel,
  onCancel,
  loading = false,
  className,
  layout = 'vertical',
  columns = 1
}: FormBuilderProps) {
  const { t } = useLanguage();
  
  // Create validation schema from fields
  const schema = z.object(
    (Array.isArray(fields) ? fields : []).reduce((acc, field) => {
      if (field.validation) {
        acc[field.id] = field.validation;
      } else if (field.required) {
        acc[field.id] = z.string().min(1, t('errors?.validation?.fieldRequired'));
      } else {
        acc[field.id] = z.string().optional();
      }
      return acc;
    }, {} as Record<string, z.ZodType<any>>)
  );

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: (Array.isArray(fields) ? fields : []).reduce((acc, field) => {
      acc[field.id] = field.defaultValue || '';
      return acc;
    }, {} as Record<string, any>)
  });

  const handleSubmit = async (data: any) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('[FormBuilder] Submission error:', error);
    }
  };

  const renderField = (field: FormField) => {
    const error = form?.formState?.errors[field.id];
    const isInvalid = !!error;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <div key={field.id} className={cn("space-y-2", field.className)}>
            <Label htmlFor={field.id} className={cn('text-white/90 font-medium', isInvalid ? 'text-red-300' : '')}>
              {field.label}
              {field.required && <span className="text-red-300 ml-1">*</span>}
            </Label>
            <Controller
              name={field.id}
              control={form.control}
              render={({ field: controllerField }) => (
                <Input
                  {...controllerField}
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  disabled={field.disabled || loading}
                  className={cn(
                    'bg-white/20 border border-white/30 rounded-xl text-white placeholder:text-white/70 backdrop-blur-sm focus:bg-white/30 focus:border-white/50 transition-all',
                    isInvalid ? 'border-red-400/50 bg-red-500/10' : ''
                  )}
                  aria-describedby={field.description ? `${field.id}-description` : undefined}
                />
              )}
            />
            {field.description && (
              <p id={`${field.id}-description`} className="text-sm text-gray-600">
                {field.description || ''}
              </p>
            )}
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error.message as string}
              </p>
            )}
          </div>
        );

      case 'password':
        return (
          <PasswordField 
            key={field.id}
            field={field}
            form={form}
            loading={loading}
            isInvalid={isInvalid}
            error={error}
          />
        );

      case 'textarea':
        return (
          <div key={field.id} className={cn("space-y-2", field.className)}>
            <Label htmlFor={field.id} className={isInvalid ? 'text-red-600' : ''}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Controller
              name={field.id}
              control={form.control}
              render={({ field: controllerField }) => (
                <Textarea
                  {...controllerField}
                  id={field.id}
                  placeholder={field.placeholder}
                  disabled={field.disabled || loading}
                  className={isInvalid ? 'border-red-500' : ''}
                  rows={4}
                  aria-describedby={field.description ? `${field.id}-description` : undefined}
                />
              )}
            />
            {field.description && (
              <p id={`${field.id}-description`} className="text-sm text-gray-600">
                {field.description || ''}
              </p>
            )}
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error.message as string}
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className={cn("space-y-2", field.className)}>
            <Label htmlFor={field.id} className={cn('text-white/90 font-medium', isInvalid ? 'text-red-300' : '')}>
              {field.label}
              {field.required && <span className="text-red-300 ml-1">*</span>}
            </Label>
            <Controller
              name={field.id}
              control={form.control}
              render={({ field: controllerField }) => (
                <Select
                  value={controllerField.value}
                  onValueChange={controllerField.onChange}
                  disabled={field.disabled || loading}
                >
                  <SelectTrigger className={cn(
                    'bg-white/20 border border-white/30 rounded-xl text-white backdrop-blur-sm focus:bg-white/30 focus:border-white/50 transition-all',
                    isInvalid ? 'border-red-400/50 bg-red-500/10' : ''
                  )}>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {field.description && (
              <p id={`${field.id}-description`} className="text-sm text-gray-600">
                {field.description || ''}
              </p>
            )}
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error.message as string}
              </p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className={cn("space-y-2", field.className)}>
            <div className="flex items-center space-x-2">
              <Controller
                name={field.id}
                control={form.control}
                render={({ field: controllerField }) => (
                  <Checkbox
                    id={field.id}
                    checked={controllerField.value}
                    onCheckedChange={controllerField.onChange}
                    disabled={field.disabled || loading}
                    aria-describedby={field.description ? `${field.id}-description` : undefined}
                  />
                )}
              />
              <Label htmlFor={field.id} className={isInvalid ? 'text-red-600' : ''}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            {field.description && (
              <p id={`${field.id}-description`} className="text-sm text-gray-600">
                {field.description || ''}
              </p>
            )}
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error.message as string}
              </p>
            )}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className={cn("space-y-2", field.className)}>
            <Label className={isInvalid ? 'text-red-600' : ''}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Controller
              name={field.id}
              control={form.control}
              render={({ field: controllerField }) => (
                <div className="space-y-2">
                  {field.options?.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`${field.id}-${option.value}`}
                        value={option.value}
                        checked={controllerField.value === option.value}
                        onChange={() => controllerField.onChange(option.value)}
                        disabled={field.disabled || loading}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`${field.id}-${option.value}`}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            />
            {field.description && (
              <p id={`${field.id}-description`} className="text-sm text-gray-600">
                {field.description || ''}
              </p>
            )}
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error.message as string}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  };

  return (
    <form 
      onSubmit={form.handleSubmit(handleSubmit)} 
      className={cn("space-y-6", className)}
    >
      <div className={cn(
        "grid gap-6",
        columns > 1 ? columnClasses[columns] : 'grid-cols-1'
      )}>
        {(Array.isArray(fields) ? fields : []).map(renderField)}
      </div>

      <div className={cn(
        "flex gap-4",
        layout === 'horizontal' ? 'flex-row' : 'flex-col sm:flex-row'
      )}>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 sm:flex-none bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          {loading && (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
          )}
          {submitLabel || t('general.submit')}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 sm:flex-none bg-white/20 border border-white/30 text-white/90 hover:bg-white/30 hover:border-white/50 rounded-xl backdrop-blur-sm transition-all"
          >
            {cancelLabel || t('general.cancel')}
          </Button>
        )}
      </div>
    </form>
  );
}

// Password field component with show/hide functionality
function PasswordField({ 
  field, 
  form, 
  loading, 
  isInvalid, 
  error 
}: {
  field: FormField;
  form: any;
  loading: boolean;
  isInvalid: boolean;
  error: any;
}) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className={cn("space-y-2", field.className)}>
      <Label htmlFor={field.id} className={isInvalid ? 'text-red-600' : ''}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        <Controller
          name={field.id}
          control={form.control}
          render={({ field: controllerField }) => (
            <Input
              {...controllerField}
              id={field.id}
              type={showPassword ? 'text' : 'password'}
              placeholder={field.placeholder}
              disabled={field.disabled || loading}
              className={cn("pr-10", isInvalid ? 'border-red-500' : '')}
              aria-describedby={field.description ? `${field.id}-description` : undefined}
            />
          )}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
      {field.description && (
        <p id={`${field.id}-description`} className="text-sm text-gray-600">
          {field.description || ''}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error.message as string}
        </p>
      )}
    </div>
  );
}

// Add default export for compatibility
export default FormBuilder;
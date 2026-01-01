import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, style, ...props }, ref) => {
    return (
      <div style={{ width: '100%' }}>
        {label && (
          <label style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: 10
          }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.08)',
            border: error ? '1px solid #f87171' : '1px solid rgba(244, 114, 182, 0.2)',
            borderRadius: 14,
            padding: '16px 18px',
            color: 'white',
            fontSize: 16,
            outline: 'none',
            transition: 'all 0.3s ease',
            ...style
          }}
          className={className}
          {...props}
        />
        {error && (
          <p style={{ marginTop: 8, fontSize: 13, color: '#f87171' }}>{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, style, ...props }, ref) => {
    return (
      <div style={{ width: '100%' }}>
        {label && (
          <label style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: 10
          }}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          style={{
            width: '100%',
            minHeight: 120,
            background: 'rgba(255, 255, 255, 0.08)',
            border: error ? '1px solid #f87171' : '1px solid rgba(244, 114, 182, 0.2)',
            borderRadius: 14,
            padding: '16px 18px',
            color: 'white',
            fontSize: 16,
            outline: 'none',
            resize: 'none',
            transition: 'all 0.3s ease',
            ...style
          }}
          className={className}
          {...props}
        />
        {error && (
          <p style={{ marginTop: 8, fontSize: 13, color: '#f87171' }}>{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, style, ...props }, ref) => {
    return (
      <div style={{ width: '100%' }}>
        {label && (
          <label style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: 10
          }}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.08)',
            border: error ? '1px solid #f87171' : '1px solid rgba(244, 114, 182, 0.2)',
            borderRadius: 14,
            padding: '16px 18px',
            paddingRight: 45,
            color: 'white',
            fontSize: 16,
            outline: 'none',
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23f472b6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6,9 12,15 18,9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 14px center',
            backgroundSize: 18,
            transition: 'all 0.3s ease',
            ...style
          }}
          className={className}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} style={{ background: '#2d1b4e', color: 'white' }}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p style={{ marginTop: 8, fontSize: 13, color: '#f87171' }}>{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

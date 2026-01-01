import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, style, ...props }, ref) => {

    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      borderRadius: 14,
      border: 'none',
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      opacity: disabled || isLoading ? 0.5 : 1,
      transition: 'all 0.3s ease',
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        background: 'linear-gradient(135deg, #ec4899, #a855f7)',
        color: 'white',
        boxShadow: '0 4px 20px rgba(236, 72, 153, 0.4)',
      },
      secondary: {
        background: 'rgba(255, 255, 255, 0.1)',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      },
      ghost: {
        background: 'transparent',
        color: 'white',
      },
      danger: {
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        color: 'white',
        boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
      },
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: { padding: '14px 20px', fontSize: 15 },
      md: { padding: '18px 28px', fontSize: 16 },
      lg: { padding: '22px 36px', fontSize: 17 },
    };

    return (
      <motion.button
        ref={ref}
        style={{
          ...baseStyle,
          ...variantStyles[variant],
          ...sizeStyles[size],
          ...style,
        }}
        className={className}
        disabled={disabled || isLoading}
        whileHover={!disabled && !isLoading ? { scale: 1.02 } : undefined}
        whileTap={!disabled && !isLoading ? { scale: 0.98 } : undefined}
        {...(props as any)}
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ marginRight: 8 }}
          >
            <Sparkles style={{ width: 18, height: 18 }} />
          </motion.div>
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

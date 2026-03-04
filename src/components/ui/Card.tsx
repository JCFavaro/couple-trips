import { forwardRef, type HTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'flat' | 'elevated';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    function getCardClass(v: CardProps['variant']): string {
      switch (v) {
        case 'flat':
          return 'card-flat';
        case 'elevated':
          return 'card-elevated';
        case 'interactive':
        case 'default':
        default:
          return 'glass-card';
      }
    }

    const cardClass = getCardClass(variant);

    if (variant === 'interactive') {
      return (
        <motion.div
          ref={ref}
          className={`${cardClass} p-4 cursor-pointer hover:bg-disney-card-hover ${className}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          {...(props as any)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={`${cardClass} p-4 ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`mb-3 ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className = '', style, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={`font-semibold ${className}`}
        style={{ fontSize: 18, color: 'var(--text-primary)', ...style }}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = 'CardTitle';

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', style, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={className}
        style={{ padding: '4px 20px 16px', ...style }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

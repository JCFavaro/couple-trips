import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  rightAction?: ReactNode;
}

export function PageWrapper({ children, title, subtitle, rightAction }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{
        flex: 1,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 56,
        paddingBottom: 'calc(120px + env(safe-area-inset-bottom, 0px))',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {(title || rightAction) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <div>
            {title && (
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  lineHeight: 1.2,
                }}
              >
                {title}
              </h1>
            )}
            {subtitle && (
              <p
                style={{
                  color: 'rgba(255, 255, 255, 0.45)',
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {rightAction}
        </div>
      )}
      {children}
    </motion.div>
  );
}

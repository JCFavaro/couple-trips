import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  const sizeStyles = {
    sm: { maxWidth: 340 },
    md: { maxWidth: 420 },
    lg: { maxWidth: 540 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '48px 16px',
          paddingBottom: 120,
          overflowY: 'auto'
        }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)'
            }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'relative',
              width: '100%',
              ...sizeStyles[size],
              background: `linear-gradient(135deg, var(--theme-bg-secondary), var(--theme-bg-tertiary))`,
              backdropFilter: 'blur(20px)',
              borderRadius: 24,
              border: '1px solid var(--glass-border)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px var(--glass-shadow)',
              padding: 28,
              maxHeight: 'calc(100vh - 180px)',
              overflowY: 'auto',
              marginTop: 'auto',
              marginBottom: 'auto'
            }}
          >
            {/* Decorative sparkles */}
            <motion.div
              style={{ position: 'absolute', top: 16, left: 20 }}
              animate={{ rotate: [0, 180, 360], scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles style={{ width: 16, height: 16, color: 'rgba(253, 224, 71, 0.6)' }} />
            </motion.div>
            <motion.div
              style={{ position: 'absolute', top: 40, right: 50 }}
              animate={{ rotate: [360, 180, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >
              <Sparkles style={{ width: 12, height: 12, color: 'var(--theme-accent)', opacity: 0.5 }} />
            </motion.div>

            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 28,
              paddingBottom: 20,
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {title && (
                <h2 style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}>
                  <Sparkles style={{ width: 20, height: 20, color: 'var(--theme-accent)' }} />
                  {title}
                </h2>
              )}
              <motion.button
                onClick={onClose}
                style={{
                  padding: 10,
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  cursor: 'pointer',
                  marginLeft: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                whileTap={{ scale: 0.9 }}
              >
                <X style={{ width: 18, height: 18, color: 'rgba(255, 255, 255, 0.7)' }} />
              </motion.button>
            </div>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 10 }}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: 28, fontSize: 15, lineHeight: 1.6 }}>
        {message}
      </p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
        <motion.button
          onClick={onClose}
          style={{
            padding: '18px 28px',
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer'
          }}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
          whileTap={{ scale: 0.98 }}
        >
          {cancelText}
        </motion.button>
        <motion.button
          onClick={handleConfirm}
          style={{
            padding: '18px 28px',
            borderRadius: 16,
            background: variant === 'danger'
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : 'linear-gradient(135deg, #eab308, #ca8a04)',
            border: 'none',
            color: 'white',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: variant === 'danger'
              ? '0 6px 20px rgba(239, 68, 68, 0.4)'
              : '0 6px 20px rgba(234, 179, 8, 0.4)'
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {confirmText}
        </motion.button>
      </div>
    </Modal>
  );
}

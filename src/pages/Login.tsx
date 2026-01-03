import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Mail, Lock, AlertCircle, Heart, MapPin } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/trips" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Email o contrasena incorrectos');
        } else {
          setError(error.message);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Plane style={{ width: 40, height: 40, color: '#6366f1' }} />
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fafafa 0%, #f5f3ff 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      {/* Logo/Brand */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: 48 }}
      >
        <motion.div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: 24,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            marginBottom: 24,
            boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)',
          }}
          whileHover={{ scale: 1.05, rotate: 5 }}
        >
          <Plane style={{ width: 40, height: 40, color: 'white' }} />
        </motion.div>

        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          color: '#1f2937',
          marginBottom: 8,
          letterSpacing: '-0.02em',
        }}>
          Couple Trips
        </h1>
        <p style={{
          fontSize: 16,
          color: '#6b7280',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}>
          <Heart style={{ width: 16, height: 16, fill: '#ec4899', color: '#ec4899' }} />
          Planifica aventuras juntos
        </p>
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'white',
          borderRadius: 24,
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e5e7eb',
          padding: 32,
        }}
      >
        <h2 style={{
          fontSize: 22,
          fontWeight: 600,
          color: '#1f2937',
          textAlign: 'center',
          marginBottom: 32,
        }}>
          Iniciar sesion
        </h2>

        <form onSubmit={handleSubmit}>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: 14,
                borderRadius: 12,
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: 14,
                marginBottom: 24,
              }}
            >
              <AlertCircle style={{ width: 18, height: 18, flexShrink: 0 }} />
              {error}
            </motion.div>
          )}

          {/* Email Input */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 500,
              color: '#374151',
              marginBottom: 8,
            }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 18,
                height: 18,
                color: '#9ca3af',
              }} />
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  padding: '14px 14px 14px 44px',
                  color: '#1f2937',
                  fontSize: 16,
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: 28 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 500,
              color: '#374151',
              marginBottom: 8,
            }}>
              Contrasena
            </label>
            <div style={{ position: 'relative' }}>
              <Lock style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 18,
                height: 18,
                color: '#9ca3af',
              }} />
              <input
                type="password"
                placeholder="Tu contrasena"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  width: '100%',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  padding: '14px 14px 14px 44px',
                  color: '#1f2937',
                  fontSize: 16,
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              fontWeight: 600,
              fontSize: 16,
              padding: '16px 24px',
              borderRadius: 12,
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              opacity: isSubmitting ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Plane style={{ width: 20, height: 20 }} />
              </motion.div>
            ) : (
              <>
                <Plane style={{ width: 20, height: 20 }} />
                Entrar
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          marginTop: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: '#9ca3af',
          fontSize: 14,
        }}
      >
        <MapPin style={{ width: 16, height: 16 }} />
        Hecho para explorar el mundo juntos
      </motion.div>
    </div>
  );
}

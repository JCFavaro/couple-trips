import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, AlertCircle, Heart } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Disney Castle SVG component
function DisneyCastle() {
  return (
    <svg viewBox="0 0 200 180" style={{ width: 160, height: 148, margin: '0 auto', filter: 'drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))' }}>
      {/* Main castle body */}
      <defs>
        <linearGradient id="castleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fce4ec" />
          <stop offset="50%" stopColor="#f8bbd9" />
          <stop offset="100%" stopColor="#f48fb1" />
        </linearGradient>
        <linearGradient id="roofGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7b1fa2" />
          <stop offset="100%" stopColor="#4a148c" />
        </linearGradient>
        <linearGradient id="towerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ce93d8" />
          <stop offset="100%" stopColor="#ab47bc" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Back towers */}
      <rect x="25" y="70" width="20" height="80" fill="url(#castleGradient)" />
      <polygon points="35,30 15,70 55,70" fill="url(#roofGradient)" />
      <rect x="155" y="70" width="20" height="80" fill="url(#castleGradient)" />
      <polygon points="165,30 145,70 185,70" fill="url(#roofGradient)" />

      {/* Middle towers */}
      <rect x="50" y="55" width="25" height="95" fill="url(#castleGradient)" />
      <polygon points="62.5,15 40,55 85,55" fill="url(#roofGradient)" />
      <rect x="125" y="55" width="25" height="95" fill="url(#castleGradient)" />
      <polygon points="137.5,15 115,55 160,55" fill="url(#roofGradient)" />

      {/* Center tower (tallest) */}
      <rect x="85" y="40" width="30" height="110" fill="url(#castleGradient)" />
      <polygon points="100,0 70,40 130,40" fill="url(#towerGradient)" />

      {/* Main building */}
      <rect x="45" y="110" width="110" height="40" fill="url(#castleGradient)" />

      {/* Windows */}
      <ellipse cx="100" cy="80" rx="8" ry="12" fill="#4a148c" opacity="0.7" />
      <ellipse cx="62.5" cy="90" rx="5" ry="8" fill="#4a148c" opacity="0.7" />
      <ellipse cx="137.5" cy="90" rx="5" ry="8" fill="#4a148c" opacity="0.7" />

      {/* Door */}
      <path d="M90 150 L90 125 Q100 115 110 125 L110 150 Z" fill="#4a148c" />

      {/* Decorative flags */}
      <line x1="100" y1="0" x2="100" y2="-10" stroke="#ffd700" strokeWidth="2" />
      <polygon points="100,-10 100,-20 115,-15" fill="#ff4081" />

      {/* Sparkle on top */}
      <circle cx="100" cy="-5" r="3" fill="#ffd700" filter="url(#glow)">
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

// Floating hearts component
function FloatingHearts() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          style={{ position: 'absolute' }}
          initial={{
            x: Math.random() * 100 + '%',
            y: '110%',
            opacity: 0.6,
            scale: 0.5 + Math.random() * 0.5
          }}
          animate={{
            y: '-10%',
            opacity: [0.6, 0.8, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: i * 2,
            ease: 'linear'
          }}
        >
          <Heart style={{ width: 16, height: 16, color: '#f9a8d4', fill: '#f9a8d4' }} />
        </motion.div>
      ))}
    </div>
  );
}

// Sparkles decoration
function SparklesDecoration() {
  const sparklePositions = [
    { top: '10%', left: '10%', delay: 0 },
    { top: '15%', right: '15%', delay: 0.5 },
    { top: '25%', left: '20%', delay: 1 },
    { top: '20%', right: '10%', delay: 1.5 },
    { top: '35%', left: '5%', delay: 2 },
    { top: '30%', right: '20%', delay: 2.5 },
  ];

  return (
    <>
      {sparklePositions.map((pos, i) => (
        <motion.div
          key={i}
          style={{ position: 'absolute', top: pos.top, left: pos.left, right: pos.right }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: pos.delay,
            ease: 'easeInOut',
          }}
        >
          <Sparkles style={{ width: 20, height: 20, color: '#fde047' }} />
        </motion.div>
      ))}
    </>
  );
}

export function Login() {
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
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
        background: 'linear-gradient(to bottom, #581c87, #831843, #312e81)'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles style={{ width: 40, height: 40, color: '#fde047' }} />
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Magical gradient background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, #1e1b4b, #581c87, #831843)'
      }} />

      {/* Stars layer */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: 4,
              height: 4,
              background: 'white',
              borderRadius: '50%',
              top: `${Math.random() * 60}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Floating hearts */}
      <FloatingHearts />

      {/* Sparkles */}
      <SparklesDecoration />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24
      }}>
        {/* Castle */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <DisneyCastle />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ textAlign: 'center', marginTop: 32, marginBottom: 48 }}
        >
          <h1 style={{
            fontSize: 36,
            fontWeight: 700,
            background: 'linear-gradient(to right, #f9a8d4, #e9d5ff, #f9a8d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Orlando 2026
          </h1>
          <p style={{
            color: 'rgba(251, 207, 232, 0.8)',
            marginTop: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}>
            <Heart style={{ width: 16, height: 16, fill: '#f472b6', color: '#f472b6' }} />
            <span>Juan & Vale</span>
            <Heart style={{ width: 16, height: 16, fill: '#f472b6', color: '#f472b6' }} />
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ width: '100%', maxWidth: 380 }}
        >
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(24px)',
            borderRadius: 28,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '48px 28px',
          }}>
            <h2 style={{
              fontSize: 26,
              fontWeight: 600,
              color: 'white',
              textAlign: 'center',
              marginBottom: 40
            }}>
              Bienvenidos
            </h2>

            <form onSubmit={handleSubmit}>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: 14,
                    borderRadius: 14,
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(248, 113, 113, 0.3)',
                    color: '#fecaca',
                    fontSize: 14,
                    marginBottom: 28
                  }}
                >
                  <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                  {error}
                </motion.div>
              )}

              {/* Email Input */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ position: 'relative' }}>
                  <Mail style={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 20,
                    height: 20,
                    color: '#f9a8d4'
                  }} />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: 16,
                      padding: '18px 16px 18px 48px',
                      color: 'white',
                      fontSize: 16,
                      outline: 'none',
                      transition: 'all 0.3s ease',
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div style={{ marginBottom: 36 }}>
                <div style={{ position: 'relative' }}>
                  <Lock style={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 20,
                    height: 20,
                    color: '#f9a8d4'
                  }} />
                  <input
                    type="password"
                    placeholder="Contrasena"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: 16,
                      padding: '18px 16px 18px 48px',
                      color: 'white',
                      fontSize: 16,
                      outline: 'none',
                      transition: 'all 0.3s ease',
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
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'linear-gradient(to right, #ec4899, #a855f7, #ec4899)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 16,
                  padding: '20px 24px',
                  borderRadius: 16,
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 10px 15px -3px rgba(236, 72, 153, 0.4)',
                  opacity: isSubmitting ? 0.5 : 1,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span style={{
                  position: 'relative',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}>
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles style={{ width: 20, height: 20 }} />
                    </motion.div>
                  ) : (
                    <>
                      <Sparkles style={{ width: 20, height: 20 }} />
                      Entrar a la magia
                    </>
                  )}
                </span>
                {/* Shimmer effect */}
                <motion.div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent)',
                  }}
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </motion.button>
            </form>
          </div>

          {/* Footer text */}
          <p style={{
            textAlign: 'center',
            color: 'rgba(251, 207, 232, 0.5)',
            fontSize: 14,
            marginTop: 32
          }}>
            Donde los suenos se hacen realidad
          </p>
        </motion.div>
      </div>
    </div>
  );
}

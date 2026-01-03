import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Mountain, ArrowRight } from 'lucide-react';
import { useTrip } from '../contexts';

// Disney Castle SVG component for Orlando
function DisneyCastle() {
  return (
    <svg viewBox="0 0 200 180" style={{ width: 160, height: 148, margin: '0 auto', filter: 'drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))' }}>
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
      <rect x="25" y="70" width="20" height="80" fill="url(#castleGradient)" />
      <polygon points="35,30 15,70 55,70" fill="url(#roofGradient)" />
      <rect x="155" y="70" width="20" height="80" fill="url(#castleGradient)" />
      <polygon points="165,30 145,70 185,70" fill="url(#roofGradient)" />
      <rect x="50" y="55" width="25" height="95" fill="url(#castleGradient)" />
      <polygon points="62.5,15 40,55 85,55" fill="url(#roofGradient)" />
      <rect x="125" y="55" width="25" height="95" fill="url(#castleGradient)" />
      <polygon points="137.5,15 115,55 160,55" fill="url(#roofGradient)" />
      <rect x="85" y="40" width="30" height="110" fill="url(#castleGradient)" />
      <polygon points="100,0 70,40 130,40" fill="url(#towerGradient)" />
      <rect x="45" y="110" width="110" height="40" fill="url(#castleGradient)" />
      <ellipse cx="100" cy="80" rx="8" ry="12" fill="#4a148c" opacity="0.7" />
      <ellipse cx="62.5" cy="90" rx="5" ry="8" fill="#4a148c" opacity="0.7" />
      <ellipse cx="137.5" cy="90" rx="5" ry="8" fill="#4a148c" opacity="0.7" />
      <path d="M90 150 L90 125 Q100 115 110 125 L110 150 Z" fill="#4a148c" />
      <line x1="100" y1="0" x2="100" y2="-10" stroke="#ffd700" strokeWidth="2" />
      <polygon points="100,-10 100,-20 115,-15" fill="#ff4081" />
      <circle cx="100" cy="-5" r="3" fill="#ffd700" filter="url(#glow)">
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

// Patagonia Mountains for Chile
function PatagoniaMountains() {
  return (
    <svg viewBox="0 0 200 160" style={{ width: 180, height: 140, margin: '0 auto', filter: 'drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))' }}>
      <defs>
        <linearGradient id="mountainGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="30%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="mountainGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="40%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="snowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>
      </defs>

      {/* Sky background */}
      <rect x="0" y="0" width="200" height="100" fill="url(#skyGradient)" rx="20" />

      {/* Back mountain */}
      <polygon points="30,140 100,30 170,140" fill="url(#mountainGradient2)" />
      <polygon points="75,60 100,30 125,60" fill="url(#snowGradient)" />

      {/* Front mountains */}
      <polygon points="0,160 60,60 120,160" fill="url(#mountainGradient1)" />
      <polygon points="40,85 60,60 80,85" fill="url(#snowGradient)" />

      <polygon points="80,160 150,50 200,160" fill="url(#mountainGradient1)" />
      <polygon points="125,80 150,50 175,80" fill="url(#snowGradient)" />

      {/* Condor */}
      <g transform="translate(140, 40)">
        <path d="M0 5 Q5 0 15 3 Q10 5 15 7 Q5 10 0 5" fill="#1e293b" />
      </g>
    </svg>
  );
}

// Floating hearts for Orlando
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

// Snow particles for Chile
function SnowParticles() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: 4 + Math.random() * 4,
            height: 4 + Math.random() * 4,
            background: 'white',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
          }}
          initial={{ y: '-10%', opacity: 0.8 }}
          animate={{
            y: '110%',
            x: [0, Math.random() * 30 - 15, 0],
            opacity: [0.8, 0.6, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

// Theme configurations
const THEME_CONFIG = {
  orlando: {
    background: 'linear-gradient(to bottom, #1e1b4b, #581c87, #831843)',
    title: 'Orlando 2026',
    subtitle: 'Donde los suenos se hacen realidad',
    button: 'Entrar a la magia',
    buttonGradient: 'linear-gradient(to right, #ec4899, #a855f7, #ec4899)',
    buttonShadow: '0 10px 15px -3px rgba(236, 72, 153, 0.4)',
    icon: DisneyCastle,
    decoration: () => <><FloatingHearts /><SparklesDecoration /></>,
    textColor: '#f9a8d4',
    iconComponent: Sparkles,
  },
  chile: {
    background: 'linear-gradient(to bottom, #0c4a6e, #0369a1, #0891b2)',
    title: 'Chile 2027',
    subtitle: 'Aventura en la Patagonia',
    button: 'Comenzar aventura',
    buttonGradient: 'linear-gradient(to right, #dc2626, #ea580c, #dc2626)',
    buttonShadow: '0 10px 15px -3px rgba(220, 38, 38, 0.4)',
    icon: PatagoniaMountains,
    decoration: SnowParticles,
    textColor: '#7dd3fc',
    iconComponent: Mountain,
  },
  default: {
    background: 'linear-gradient(to bottom, #18181b, #27272a, #3f3f46)',
    title: 'Tu viaje',
    subtitle: 'Una nueva aventura te espera',
    button: 'Comenzar',
    buttonGradient: 'linear-gradient(to right, #6366f1, #8b5cf6, #6366f1)',
    buttonShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)',
    icon: () => null,
    decoration: () => null,
    textColor: '#a78bfa',
    iconComponent: Sparkles,
  },
};

export function TripWelcome() {
  const navigate = useNavigate();
  const { currentTrip } = useTrip();

  if (!currentTrip) {
    navigate('/trips');
    return null;
  }

  const themeKey = (currentTrip.theme as keyof typeof THEME_CONFIG) || 'default';
  const theme = THEME_CONFIG[themeKey] || THEME_CONFIG.default;
  const IconComponent = theme.icon;
  const DecorationComponent = theme.decoration;
  const ButtonIcon = theme.iconComponent;

  const handleContinue = () => {
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, background: theme.background }} />

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

      {/* Decorations */}
      {DecorationComponent && <DecorationComponent />}

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}>
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {IconComponent ? (
            <IconComponent />
          ) : (
            <div style={{
              fontSize: 120,
              lineHeight: 1,
              marginBottom: 16,
            }}>
              {currentTrip.emoji}
            </div>
          )}
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
            background: `linear-gradient(to right, ${theme.textColor}, white, ${theme.textColor})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {currentTrip.nombre}
          </h1>
          <p style={{
            color: theme.textColor,
            opacity: 0.8,
            marginTop: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}>
            <Heart style={{ width: 16, height: 16, fill: theme.textColor, color: theme.textColor }} />
            <span>Juan & Vale</span>
            <Heart style={{ width: 16, height: 16, fill: theme.textColor, color: theme.textColor }} />
          </p>
        </motion.div>

        {/* Enter Button */}
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          onClick={handleContinue}
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: theme.buttonGradient,
            color: 'white',
            fontWeight: 600,
            fontSize: 18,
            padding: '20px 48px',
            borderRadius: 20,
            border: 'none',
            cursor: 'pointer',
            boxShadow: theme.buttonShadow,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ButtonIcon style={{ width: 22, height: 22 }} />
          {theme.button}
          <ArrowRight style={{ width: 20, height: 20 }} />

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

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            color: theme.textColor,
            opacity: 0.5,
            fontSize: 14,
            marginTop: 32,
          }}
        >
          {theme.subtitle}
        </motion.p>
      </div>
    </div>
  );
}

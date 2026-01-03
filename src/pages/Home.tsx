import { motion } from 'framer-motion';
import { Sparkles, DollarSign, Calendar, MapPin, Heart, CreditCard, Wallet, ArrowLeftRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout';
import { useItinerario, useLugares, useTripConfig, useGastos } from '../hooks';
import { useTrip } from '../contexts';
import { formatCurrency, formatDate } from '../lib/utils';

// Disney Castle SVG - Pink version
function MiniCastle() {
  return (
    <svg viewBox="0 0 100 90" style={{ width: 80, height: 72 }}>
      <defs>
        <linearGradient id="miniCastleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fce4ec" />
          <stop offset="100%" stopColor="#f48fb1" />
        </linearGradient>
        <linearGradient id="miniRoofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ce93d8" />
          <stop offset="100%" stopColor="#7b1fa2" />
        </linearGradient>
      </defs>
      <rect x="12" y="35" width="10" height="40" fill="url(#miniCastleGrad)" />
      <polygon points="17,15 7,35 27,35" fill="url(#miniRoofGrad)" />
      <rect x="78" y="35" width="10" height="40" fill="url(#miniCastleGrad)" />
      <polygon points="83,15 73,35 93,35" fill="url(#miniRoofGrad)" />
      <rect x="25" y="27" width="12" height="48" fill="url(#miniCastleGrad)" />
      <polygon points="31,7 19,27 43,27" fill="url(#miniRoofGrad)" />
      <rect x="63" y="27" width="12" height="48" fill="url(#miniCastleGrad)" />
      <polygon points="69,7 57,27 81,27" fill="url(#miniRoofGrad)" />
      <rect x="42" y="20" width="16" height="55" fill="url(#miniCastleGrad)" />
      <polygon points="50,0 35,20 65,20" fill="url(#miniRoofGrad)" />
      <rect x="22" y="55" width="56" height="20" fill="url(#miniCastleGrad)" />
      <path d="M45 75 L45 62 Q50 57 55 62 L55 75 Z" fill="#7b1fa2" />
      <circle cx="50" cy="2" r="2" fill="#ffd700">
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

// Chile Mountains SVG
function MiniMountain() {
  return (
    <svg viewBox="0 0 100 80" style={{ width: 80, height: 64 }}>
      <defs>
        <linearGradient id="mountainGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="mountainGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="snowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      {/* Back mountain */}
      <polygon points="15,80 50,15 85,80" fill="url(#mountainGrad1)" />
      <polygon points="40,30 50,15 60,30" fill="url(#snowGrad)" />
      {/* Front mountain */}
      <polygon points="0,80 35,25 70,80" fill="url(#mountainGrad2)" />
      <polygon points="25,40 35,25 45,40" fill="url(#snowGrad)" />
      {/* Condor */}
      <path d="M75 25 Q80 22 88 24 Q82 26 88 28 Q80 30 75 25" fill="#1e293b" />
    </svg>
  );
}

// Theme-based trip icon
function TripIcon({ theme }: { theme: string }) {
  if (theme === 'orlando') return <MiniCastle />;
  if (theme === 'chile') return <MiniMountain />;
  return <span style={{ fontSize: 64 }}>✈️</span>;
}

// Countdown messages per theme
function getCountdownMsg(theme: string, daysUntil: number, onTrip: boolean) {
  if (onTrip) {
    if (theme === 'orlando') return 'Viviendo la magia!';
    if (theme === 'chile') return 'Explorando la aventura!';
    return 'Disfrutando el viaje!';
  }
  if (daysUntil <= 0) return 'El viaje ya paso';
  if (theme === 'orlando') return `Faltan ${daysUntil} dias para la magia`;
  if (theme === 'chile') return `Faltan ${daysUntil} dias para la aventura`;
  return `Faltan ${daysUntil} dias`;
}

export function Home() {
  const navigate = useNavigate();
  const { currentTrip, clearTrip } = useTrip();
  const { daysUntil, onTrip, config } = useTripConfig();
  const { balance, resumenCuotas } = useGastos();
  const { items: itinerario } = useItinerario();
  const { pendientes: lugaresPendientes } = useLugares();

  const today = new Date().toISOString().split('T')[0];
  const nextActivity = itinerario.find((item) => item.fecha >= today);

  const tripTheme = currentTrip?.theme || 'default';
  const tripName = currentTrip?.nombre || 'Tu Viaje';
  const countdownMsg = getCountdownMsg(tripTheme, daysUntil, onTrip);

  const handleChangeTrip = () => {
    clearTrip();
    navigate('/trips');
  };

  return (
    <PageWrapper>
      {/* Trip Switcher Button - Fixed at top right */}
      <motion.button
        onClick={handleChangeTrip}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          borderRadius: 20,
          background: 'var(--glass-bg-1)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--glass-border)',
          color: 'white',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
        }}
        whileHover={{ scale: 1.05, borderColor: 'var(--glass-border-hover)' }}
        whileTap={{ scale: 0.95 }}
      >
        <span style={{ fontSize: 16 }}>{currentTrip?.emoji || '✈️'}</span>
        <ArrowLeftRight style={{ width: 16, height: 16, color: 'var(--theme-accent)' }} />
      </motion.button>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: 56 }}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ display: 'inline-block', marginBottom: 20 }}
        >
          <TripIcon theme={tripTheme} />
        </motion.div>
        <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 700 }}>
          {tripName}
        </h1>
        <p style={{
          color: 'var(--theme-text-muted)',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginTop: 12
        }}>
          <Heart style={{ width: 14, height: 14, fill: 'var(--heart-color)', color: 'var(--heart-color)' }} />
          Juan & Vale
          <Heart style={{ width: 14, height: 14, fill: 'var(--heart-color)', color: 'var(--heart-color)' }} />
        </p>
      </motion.div>

      {/* Countdown Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: 56 }}
      >
        <div className="glass-card" style={{ padding: 32, position: 'relative', overflow: 'hidden' }}>
          {/* Decorative sparkles */}
          <Sparkles className="sparkle" style={{ position: 'absolute', top: 20, left: 20, width: 20, height: 20, color: 'var(--theme-accent)', opacity: 0.4 }} />
          <Sparkles className="sparkle" style={{ position: 'absolute', top: 20, right: 20, width: 20, height: 20, color: 'var(--theme-secondary)', opacity: 0.4, animationDelay: '0.5s' }} />

          <div style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>
            {!onTrip && daysUntil > 0 && (
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="shimmer-text" style={{ fontSize: 72, fontWeight: 700 }}>{daysUntil}</span>
              </motion.div>
            )}

            <p style={{ fontSize: 20, color: 'white', marginTop: 16, fontWeight: 500 }}>
              {countdownMsg}
            </p>

            <p style={{ color: 'var(--theme-text-muted)', fontSize: 14, marginTop: 12 }}>
              {formatDate(config.trip_start_date, "d 'de' MMMM")} - {formatDate(config.trip_end_date, "d 'de' MMMM, yyyy")}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Balance Card - Separado por moneda */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ marginBottom: 32 }}
      >
        <Link to="/gastos" style={{ textDecoration: 'none' }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                padding: 10,
                borderRadius: 14,
                background: 'var(--glass-bg-1)'
              }}>
                <Wallet style={{ width: 20, height: 20, color: 'var(--theme-accent)' }} />
              </div>
              <span style={{ color: 'var(--theme-text-muted)', fontSize: 14, fontWeight: 500 }}>Balance Total</span>
            </div>

            {/* Total gastado */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 32, fontWeight: 700, color: 'white' }}>
                {formatCurrency(balance.totalGeneral.usd)}
              </p>
              {balance.totalGeneral.ars > 0 && (
                <p style={{ fontSize: 18, color: 'var(--theme-text-muted)', marginTop: 4 }}>
                  + {formatCurrency(balance.totalGeneral.ars, 'ARS')}
                </p>
              )}
            </div>

            {/* Balance USD */}
            {balance.usd.total > 0 && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 }}>
                  <div style={{
                    padding: 12,
                    background: 'var(--glass-bg-1)',
                    borderRadius: 12,
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: 11, color: 'var(--color-juan)', opacity: 0.8, marginBottom: 4 }}>Juan (USD)</p>
                    <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-juan)' }}>
                      {formatCurrency(balance.usd.juan)}
                    </p>
                  </div>
                  <div style={{
                    padding: 12,
                    background: 'var(--glass-bg-2)',
                    borderRadius: 12,
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: 11, color: 'var(--color-vale)', opacity: 0.8, marginBottom: 4 }}>Vale (USD)</p>
                    <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-vale)' }}>
                      {formatCurrency(balance.usd.vale)}
                    </p>
                  </div>
                </div>
                {balance.usd.deudor && (
                  <p style={{ fontSize: 12, color: 'var(--success-color)', textAlign: 'center', marginBottom: 12 }}>
                    {balance.usd.deudor} debe {formatCurrency(balance.usd.diferencia)} a {balance.usd.deudor === 'Juan' ? 'Vale' : 'Juan'}
                  </p>
                )}
              </>
            )}

            {/* Balance ARS */}
            {balance.ars.total > 0 && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 }}>
                  <div style={{
                    padding: 12,
                    background: 'var(--glass-bg-1)',
                    borderRadius: 12,
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: 11, color: 'var(--color-juan)', opacity: 0.8, marginBottom: 4 }}>Juan (ARS)</p>
                    <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-juan)' }}>
                      {formatCurrency(balance.ars.juan, 'ARS')}
                    </p>
                  </div>
                  <div style={{
                    padding: 12,
                    background: 'var(--glass-bg-2)',
                    borderRadius: 12,
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: 11, color: 'var(--color-vale)', opacity: 0.8, marginBottom: 4 }}>Vale (ARS)</p>
                    <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-vale)' }}>
                      {formatCurrency(balance.ars.vale, 'ARS')}
                    </p>
                  </div>
                </div>
                {balance.ars.deudor && (
                  <p style={{ fontSize: 12, color: 'var(--theme-accent)', textAlign: 'center' }}>
                    {balance.ars.deudor} debe {formatCurrency(balance.ars.diferencia, 'ARS')} a {balance.ars.deudor === 'Juan' ? 'Vale' : 'Juan'}
                  </p>
                )}
              </>
            )}
          </div>
        </Link>
      </motion.div>

      {/* Quick Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
        {/* Cuotas Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Link to="/gastos" style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{ padding: 20, height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  padding: 8,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.3), rgba(34, 197, 94, 0.3))'
                }}>
                  <CreditCard style={{ width: 18, height: 18, color: 'var(--success-color)' }} />
                </div>
                <span style={{ color: 'var(--theme-text-muted)', fontSize: 13, fontWeight: 500 }}>Cuotas</span>
              </div>
              <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--success-color)', marginBottom: 4 }}>
                {resumenCuotas.progresoGeneral}%
              </p>
              <p style={{ fontSize: 11, color: 'var(--theme-text-muted)' }}>
                {formatCurrency(resumenCuotas.totalPagado)} / {formatCurrency(resumenCuotas.totalAPagar)}
              </p>
              {/* Mini progress bar */}
              {resumenCuotas.cantidad > 0 && (
                <div style={{
                  height: 6,
                  background: 'var(--glass-bg-1)',
                  borderRadius: 999,
                  marginTop: 10,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${resumenCuotas.progresoGeneral}%`,
                    height: '100%',
                    background: resumenCuotas.progresoGeneral >= 100
                      ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                      : 'var(--tab-active-gradient)',
                    borderRadius: 999
                  }} />
                </div>
              )}
            </div>
          </Link>
        </motion.div>

        {/* Lugares Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Link to="/config" style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{ padding: 20, height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  padding: 8,
                  borderRadius: 12,
                  background: 'var(--glass-bg-1)'
                }}>
                  <MapPin style={{ width: 18, height: 18, color: 'var(--theme-accent)' }} />
                </div>
                <span style={{ color: 'var(--theme-text-muted)', fontSize: 13, fontWeight: 500 }}>Lugares</span>
              </div>
              <p style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 4 }}>
                {lugaresPendientes}
              </p>
              <p style={{ fontSize: 11, color: 'var(--theme-text-muted)' }}>por visitar</p>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Next Activity Section */}
      {nextActivity && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ marginBottom: 56 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Calendar style={{ width: 20, height: 20, color: 'var(--theme-accent)' }} />
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'white' }}>Proxima actividad</h2>
          </div>
          <Link to="/itinerario" style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: 'white', fontSize: 17 }}>
                    {nextActivity.titulo}
                  </p>
                  {nextActivity.descripcion && (
                    <p style={{
                      color: 'var(--theme-text-muted)',
                      fontSize: 14,
                      marginTop: 8,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {nextActivity.descripcion}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    padding: '10px 16px',
                    borderRadius: 14,
                    background: 'var(--glass-bg-1)',
                    border: '1px solid var(--glass-border)'
                  }}>
                    <p style={{ color: 'var(--theme-accent)', fontSize: 14, fontWeight: 600 }}>
                      {formatDate(nextActivity.fecha, "d MMM")}
                    </p>
                  </div>
                  {nextActivity.hora && (
                    <p style={{ color: 'var(--theme-text-muted)', fontSize: 12, marginTop: 8 }}>
                      {nextActivity.hora}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Quick Links Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 style={{
          fontSize: 18,
          fontWeight: 600,
          color: 'white',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <Sparkles style={{ width: 20, height: 20, color: 'var(--theme-accent)' }} />
          Accesos rapidos
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {[
            { to: '/gastos', icon: DollarSign, label: 'Gastos' },
            { to: '/itinerario', icon: Calendar, label: 'Itinerario' },
          ].map((item) => (
            <motion.div
              key={item.to}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to={item.to} style={{ textDecoration: 'none' }}>
                <div className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      margin: '0 auto',
                      borderRadius: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                      background: 'var(--icon-bg-1)'
                    }}
                  >
                    <item.icon style={{ width: 24, height: 24, color: 'white' }} />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--theme-text-muted)', fontWeight: 500 }}>
                    {item.label}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </PageWrapper>
  );
}

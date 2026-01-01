import { motion } from 'framer-motion';
import { Sparkles, DollarSign, Calendar, MapPin, Heart, ArrowRight, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../components/layout';
import { useGastos, useItinerario, useLugares, useTripConfig, usePaymentPlans } from '../hooks';
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

export function Home() {
  const { daysUntil, countdownMessage, onTrip, config } = useTripConfig();
  const { balance } = useGastos();
  const { items: itinerario } = useItinerario();
  const { pendientes: lugaresPendientes } = useLugares();
  const { resumen: paymentResumen } = usePaymentPlans();

  const today = new Date().toISOString().split('T')[0];
  const nextActivity = itinerario.find((item) => item.fecha >= today);

  return (
    <PageWrapper>
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
          <MiniCastle />
        </motion.div>
        <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 700 }}>
          Orlando 2026
        </h1>
        <p style={{
          color: 'rgba(192, 132, 252, 0.7)',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginTop: 12
        }}>
          <Heart style={{ width: 14, height: 14, fill: '#f472b6', color: '#f472b6' }} />
          Juan & Vale
          <Heart style={{ width: 14, height: 14, fill: '#f472b6', color: '#f472b6' }} />
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
          <Sparkles className="sparkle" style={{ position: 'absolute', top: 20, left: 20, width: 20, height: 20, color: 'rgba(244, 114, 182, 0.4)' }} />
          <Sparkles className="sparkle" style={{ position: 'absolute', top: 20, right: 20, width: 20, height: 20, color: 'rgba(168, 85, 247, 0.4)', animationDelay: '0.5s' }} />

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
              {countdownMessage}
            </p>

            <p style={{ color: 'rgba(192, 132, 252, 0.6)', fontSize: 14, marginTop: 12 }}>
              {formatDate(config.trip_start_date, "d 'de' MMMM")} - {formatDate(config.trip_end_date, "d 'de' MMMM, yyyy")}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 56 }}>
        {/* Gastos Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link to="/gastos" style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{ padding: 24, height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  padding: 10,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(168, 85, 247, 0.3))'
                }}>
                  <DollarSign style={{ width: 20, height: 20, color: '#f9a8d4' }} />
                </div>
                <span style={{ color: 'rgba(233, 213, 255, 0.7)', fontSize: 14, fontWeight: 500 }}>Gastos</span>
              </div>
              <p style={{ fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 8 }}>
                {formatCurrency(balance.total)}
              </p>
              {balance.deudor && (
                <p style={{ fontSize: 12, color: 'rgba(244, 114, 182, 0.7)' }}>
                  {balance.deudor} debe {formatCurrency(balance.diferencia)}
                </p>
              )}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 16,
                color: 'rgba(244, 114, 182, 0.6)',
                fontSize: 12
              }}>
                <span>Ver detalle</span>
                <ArrowRight style={{ width: 14, height: 14 }} />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Lugares Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link to="/config" style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{ padding: 24, height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  padding: 10,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(236, 72, 153, 0.3))'
                }}>
                  <MapPin style={{ width: 20, height: 20, color: '#c4b5fd' }} />
                </div>
                <span style={{ color: 'rgba(233, 213, 255, 0.7)', fontSize: 14, fontWeight: 500 }}>Lugares</span>
              </div>
              <p style={{ fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 8 }}>
                {lugaresPendientes}
              </p>
              <p style={{ fontSize: 12, color: 'rgba(192, 132, 252, 0.7)' }}>por visitar</p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 16,
                color: 'rgba(168, 85, 247, 0.6)',
                fontSize: 12
              }}>
                <span>Ver lista</span>
                <ArrowRight style={{ width: 14, height: 14 }} />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Payment Progress Card */}
      {paymentResumen.totalPlanes > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{ marginBottom: 56 }}
        >
          <Link to="/pagos" style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  padding: 10,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.3), rgba(34, 197, 94, 0.3))'
                }}>
                  <CreditCard style={{ width: 20, height: 20, color: '#4ade80' }} />
                </div>
                <span style={{ color: 'rgba(233, 213, 255, 0.7)', fontSize: 14, fontWeight: 500 }}>Plan de pagos</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 28, fontWeight: 700, color: '#4ade80' }}>
                    {paymentResumen.progresoGeneral.toFixed(0)}%
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(192, 132, 252, 0.6)' }}>
                    {formatCurrency(paymentResumen.totalPagado, 'USD')} de {formatCurrency(paymentResumen.totalAPagar, 'USD')}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 14, color: 'rgba(192, 132, 252, 0.7)' }}>
                    {paymentResumen.totalPlanes} {paymentResumen.totalPlanes === 1 ? 'plan' : 'planes'}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{
                height: 10,
                background: 'rgba(139, 92, 246, 0.2)',
                borderRadius: 999,
                overflow: 'hidden'
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${paymentResumen.progresoGeneral}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                  style={{
                    height: '100%',
                    background: paymentResumen.progresoGeneral >= 100
                      ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                      : 'linear-gradient(90deg, #ec4899, #a855f7)',
                    borderRadius: 999
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 16,
                color: 'rgba(74, 222, 128, 0.7)',
                fontSize: 12
              }}>
                <span>Ver planes</span>
                <ArrowRight style={{ width: 14, height: 14 }} />
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Next Activity Section */}
      {nextActivity && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ marginBottom: 56 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Calendar style={{ width: 20, height: 20, color: '#f472b6' }} />
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
                      color: 'rgba(192, 132, 252, 0.6)',
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
                    background: 'linear-gradient(to right, rgba(236, 72, 153, 0.2), rgba(168, 85, 247, 0.2))',
                    border: '1px solid rgba(236, 72, 153, 0.3)'
                  }}>
                    <p style={{ color: '#f9a8d4', fontSize: 14, fontWeight: 600 }}>
                      {formatDate(nextActivity.fecha, "d MMM")}
                    </p>
                  </div>
                  {nextActivity.hora && (
                    <p style={{ color: 'rgba(192, 132, 252, 0.5)', fontSize: 12, marginTop: 8 }}>
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
          <Sparkles style={{ width: 20, height: 20, color: '#f472b6' }} />
          Accesos rapidos
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { to: '/gastos', icon: DollarSign, label: 'Nuevo gasto', color: 'from-pink-500 to-rose-500' },
            { to: '/itinerario', icon: Calendar, label: 'Itinerario', color: 'from-purple-500 to-pink-500' },
            { to: '/pagos', icon: CreditCard, label: 'Pagos', color: 'from-green-500 to-emerald-500' },
          ].map((item) => (
            <motion.div
              key={item.to}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to={item.to} style={{ textDecoration: 'none' }}>
                <div className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
                  <div
                    className={`bg-gradient-to-br ${item.color}`}
                    style={{
                      width: 52,
                      height: 52,
                      margin: '0 auto',
                      borderRadius: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12
                    }}
                  >
                    <item.icon style={{ width: 24, height: 24, color: 'white' }} />
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(233, 213, 255, 0.8)', fontWeight: 500 }}>
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

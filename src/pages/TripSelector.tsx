import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, Calendar, MapPin, Heart } from 'lucide-react';
import { useTrip } from '../contexts';
import { formatDate } from '../lib/utils';

export function TripSelector() {
  const navigate = useNavigate();
  const { trips, loading, selectTrip } = useTrip();

  const handleSelectTrip = (tripId: string) => {
    selectTrip(tripId);
    navigate('/welcome');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Plane style={{ width: 48, height: 48, color: '#6366f1' }} />
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fafafa 0%, #f5f3ff 100%)',
      padding: '40px 20px',
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: 'center',
          marginBottom: 48,
        }}
      >
        <motion.div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 24px',
            borderRadius: 100,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            marginBottom: 24,
          }}
          whileHover={{ scale: 1.05 }}
        >
          <Plane style={{ width: 24, height: 24, color: 'white' }} />
          <span style={{ color: 'white', fontWeight: 600, fontSize: 16 }}>Nuestros Viajes</span>
        </motion.div>

        <h1 style={{
          fontSize: 36,
          fontWeight: 700,
          color: '#1f2937',
          marginBottom: 8,
          letterSpacing: '-0.02em',
        }}>
          Juan & Vale
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
          Planificando aventuras juntos
        </p>
      </motion.div>

      {/* Trip Cards */}
      <div style={{
        maxWidth: 600,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>
        {trips.map((trip, index) => (
          <motion.button
            key={trip.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleSelectTrip(trip.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: 24,
              borderRadius: 20,
              background: 'white',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
            }}
            whileHover={{
              scale: 1.02,
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Emoji Circle */}
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${trip.color_primary}20, ${trip.color_secondary}20)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              flexShrink: 0,
            }}>
              {trip.emoji}
            </div>

            {/* Trip Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#1f2937',
                marginBottom: 6,
              }}>
                {trip.nombre}
              </h2>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: '#6b7280',
                fontSize: 14,
                marginBottom: 8,
              }}>
                <MapPin style={{ width: 14, height: 14 }} />
                {trip.destino}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: '#9ca3af',
                fontSize: 13,
              }}>
                <Calendar style={{ width: 14, height: 14 }} />
                {formatDate(trip.fecha_inicio, "d MMM")} - {formatDate(trip.fecha_fin, "d MMM yyyy")}
              </div>
            </div>

            {/* Arrow */}
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${trip.color_primary}, ${trip.color_secondary})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </motion.button>
        ))}

        {/* Add New Trip Button (placeholder) */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: trips.length * 0.1 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: 24,
            borderRadius: 20,
            background: 'transparent',
            border: '2px dashed #d1d5db',
            cursor: 'pointer',
            color: '#9ca3af',
            fontSize: 16,
            fontWeight: 500,
          }}
          whileHover={{
            borderColor: '#6366f1',
            color: '#6366f1',
            background: '#f5f3ff',
          }}
          whileTap={{ scale: 0.98 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Agregar nuevo viaje
        </motion.button>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          textAlign: 'center',
          marginTop: 64,
          color: '#9ca3af',
          fontSize: 13,
        }}
      >
        <p>Hecho con amor para nuestras aventuras</p>
      </motion.div>
    </div>
  );
}

import { NavLink, useNavigate } from 'react-router-dom';
import { Home, DollarSign, Calendar, Settings, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export function BottomNav() {
  const navigate = useNavigate();

  const handleFabClick = () => {
    navigate('/gastos?nuevo=1');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      {/* Background gradient fade - helps content transition smoothly */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: 120,
          background: 'linear-gradient(to top, #1a0a2e 0%, #1a0a2e 40%, transparent 100%)',
        }}
      />

      {/* FAB - Floating Action Button - just slightly above nav */}
      <motion.button
        onClick={handleFabClick}
        className="absolute left-1/2 -translate-x-1/2 z-20"
        style={{
          bottom: 'calc(52px + max(8px, env(safe-area-inset-bottom)))',
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
          boxShadow: '0 4px 16px rgba(236, 72, 153, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '3px solid #1a0a2e',
        }}
        whileTap={{ scale: 0.92 }}
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
      </motion.button>

      {/* Nav bar container */}
      <div
        className="relative mx-3 rounded-t-2xl border-t border-x border-purple-500/20"
        style={{
          background: 'rgba(26, 10, 46, 0.95)',
          backdropFilter: 'blur(20px)',
          paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        }}
      >
        {/* Tab grid - 5 columns with center empty for FAB */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 72px 1fr 1fr',
            alignItems: 'center',
            paddingTop: 8,
            paddingBottom: 4,
          }}
        >
          <NavTab to="/" icon={Home} label="Inicio" />
          <NavTab to="/gastos" icon={DollarSign} label="Gastos" />

          {/* Empty center space for FAB */}
          <div />

          <NavTab to="/itinerario" icon={Calendar} label="Viaje" />
          <NavTab to="/config" icon={Settings} label="Config" />
        </div>
      </div>
    </nav>
  );
}

interface NavTabProps {
  to: string;
  icon: typeof Home;
  label: string;
}

function NavTab({ to, icon: Icon, label }: NavTabProps) {
  return (
    <NavLink
      to={to}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: '8px 4px',
        minHeight: 56,
        textDecoration: 'none',
      }}
    >
      {({ isActive }) => (
        <>
          <Icon
            style={{
              width: 24,
              height: 24,
              color: isActive ? '#ffffff' : 'rgba(168, 85, 247, 0.5)',
              transition: 'color 0.2s',
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#ffffff' : 'rgba(168, 85, 247, 0.5)',
              transition: 'color 0.2s',
            }}
          >
            {label}
          </span>
          {isActive && (
            <motion.div
              layoutId="navDot"
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#ec4899',
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

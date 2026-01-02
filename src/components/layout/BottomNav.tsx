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
      {/* Background gradient fade */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#1a0a2e] via-[#1a0a2e]/90 to-transparent pointer-events-none" />

      {/* FAB - Floating Action Button - FUERA de la barra */}
      <motion.button
        onClick={handleFabClick}
        className="absolute left-1/2 -translate-x-1/2 z-20"
        style={{
          bottom: 'calc(68px + max(16px, env(safe-area-inset-bottom)))',
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
          boxShadow: '0 8px 32px rgba(236, 72, 153, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        whileTap={{ scale: 0.92 }}
      >
        <Plus className="w-8 h-8 text-white" strokeWidth={2.5} />
      </motion.button>

      {/* Nav bar */}
      <div
        className="relative mx-4 rounded-t-3xl border-t border-x border-purple-500/20 backdrop-blur-xl"
        style={{
          background: 'rgba(26, 10, 46, 0.98)',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        }}
      >
        <div className="flex items-center justify-around px-2 pt-4 pb-2">
          {/* Left tabs */}
          <NavLink
            to="/"
            className="flex flex-col items-center gap-2 px-6 py-3 rounded-2xl transition-all"
          >
            {({ isActive }) => (
              <>
                <Home className={`w-7 h-7 ${isActive ? 'text-white' : 'text-purple-400/60'}`} />
                <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-purple-400/60'}`}>
                  Inicio
                </span>
                {isActive && (
                  <motion.div
                    className="w-2 h-2 rounded-full bg-pink-500"
                    layoutId="dot"
                  />
                )}
              </>
            )}
          </NavLink>

          <NavLink
            to="/gastos"
            className="flex flex-col items-center gap-2 px-6 py-3 rounded-2xl transition-all"
          >
            {({ isActive }) => (
              <>
                <DollarSign className={`w-7 h-7 ${isActive ? 'text-white' : 'text-purple-400/60'}`} />
                <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-purple-400/60'}`}>
                  Gastos
                </span>
                {isActive && (
                  <motion.div
                    className="w-2 h-2 rounded-full bg-pink-500"
                    layoutId="dot"
                  />
                )}
              </>
            )}
          </NavLink>

          {/* Spacer for FAB */}
          <div className="w-20" />

          {/* Right tabs */}
          <NavLink
            to="/itinerario"
            className="flex flex-col items-center gap-2 px-6 py-3 rounded-2xl transition-all"
          >
            {({ isActive }) => (
              <>
                <Calendar className={`w-7 h-7 ${isActive ? 'text-white' : 'text-purple-400/60'}`} />
                <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-purple-400/60'}`}>
                  Viaje
                </span>
                {isActive && (
                  <motion.div
                    className="w-2 h-2 rounded-full bg-pink-500"
                    layoutId="dot"
                  />
                )}
              </>
            )}
          </NavLink>

          <NavLink
            to="/config"
            className="flex flex-col items-center gap-2 px-6 py-3 rounded-2xl transition-all"
          >
            {({ isActive }) => (
              <>
                <Settings className={`w-7 h-7 ${isActive ? 'text-white' : 'text-purple-400/60'}`} />
                <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-purple-400/60'}`}>
                  Config
                </span>
                {isActive && (
                  <motion.div
                    className="w-2 h-2 rounded-full bg-pink-500"
                    layoutId="dot"
                  />
                )}
              </>
            )}
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

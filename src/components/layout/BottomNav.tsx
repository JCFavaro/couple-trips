import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, DollarSign, Calendar, Settings, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/gastos', icon: DollarSign, label: 'Gastos' },
  { to: 'fab', icon: Plus, label: '' }, // Placeholder for FAB
  { to: '/itinerario', icon: Calendar, label: 'Viaje' },
  { to: '/config', icon: Settings, label: 'Config' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleFabClick = () => {
    navigate('/gastos?nuevo=1');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      {/* Background gradient fade */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#1a0a2e] via-[#1a0a2e]/80 to-transparent pointer-events-none" />

      {/* Nav bar container */}
      <div className="relative mx-4 mb-4">
        {/* Nav bar */}
        <div
          className="rounded-3xl backdrop-blur-xl border border-purple-500/20"
          style={{ background: 'rgba(26, 10, 46, 0.95)' }}
        >
          <div className="flex items-end justify-between px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
            {navItems.map((item) => {
              // FAB central
              if (item.to === 'fab') {
                return (
                  <div key="fab" className="relative -mt-10 flex-shrink-0">
                    <motion.button
                      onClick={handleFabClick}
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                        boxShadow: '0 8px 24px rgba(236, 72, 153, 0.5)',
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
                    </motion.button>
                  </div>
                );
              }

              // Regular nav items
              const isActive = location.pathname === item.to ||
                (item.to === '/' && location.pathname === '/');

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex flex-col items-center justify-center gap-1.5 py-2 flex-1 relative"
                >
                  <item.icon
                    className={`w-6 h-6 transition-colors ${
                      isActive ? 'text-white' : 'text-purple-400/60'
                    }`}
                  />
                  <span
                    className={`text-xs font-medium transition-colors ${
                      isActive ? 'text-white' : 'text-purple-400/60'
                    }`}
                  >
                    {item.label}
                  </span>
                  {/* Dot indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-pink-500"
                      layoutId="nav-dot"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

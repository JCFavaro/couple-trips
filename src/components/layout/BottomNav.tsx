import { NavLink } from 'react-router-dom';
import { Home, DollarSign, Calendar, CreditCard, Settings, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/gastos', icon: DollarSign, label: 'Gastos' },
  { to: '/itinerario', icon: Calendar, label: 'Viaje' },
  { to: '/pagos', icon: CreditCard, label: 'Pagos' },
  { to: '/config', icon: Settings, label: 'Config' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      {/* Gradient blur background */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a2e] via-[#1a0a2e]/95 to-transparent" />

      <div className="relative">
        <div className="mx-3 mb-0 rounded-2xl bg-gradient-to-r from-purple-900/80 via-pink-900/80 to-purple-900/80 backdrop-blur-xl border border-pink-500/20 shadow-lg shadow-pink-500/10">
          <div className="flex items-center justify-around px-3 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="relative flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl transition-all"
              >
                {({ isActive }) => (
                  <>
                    {/* Active background glow */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-bg"
                        className="absolute inset-0 bg-gradient-to-r from-pink-500/30 to-purple-500/30 rounded-xl"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}

                    <motion.div
                      className="relative z-10"
                      initial={false}
                      animate={isActive ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      {isActive ? (
                        <div className="relative">
                          <item.icon className="w-7 h-7 text-pink-400" />
                          {/* Sparkle on active */}
                          <Sparkles className="absolute -top-1.5 -right-1.5 w-4 h-4 text-yellow-400 animate-pulse" />
                        </div>
                      ) : (
                        <item.icon className="w-6 h-6 text-purple-300/60" />
                      )}
                    </motion.div>

                    <span className={`relative z-10 text-sm font-medium transition-colors ${
                      isActive ? 'text-pink-300' : 'text-purple-300/60'
                    }`}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

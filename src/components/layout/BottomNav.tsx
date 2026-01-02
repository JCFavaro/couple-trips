import { NavLink, useNavigate } from 'react-router-dom';
import { Home, DollarSign, Calendar, Settings, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const leftItems = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/gastos', icon: DollarSign, label: 'Gastos' },
];

const rightItems = [
  { to: '/itinerario', icon: Calendar, label: 'Viaje' },
  { to: '/config', icon: Settings, label: 'Config' },
];

export function BottomNav() {
  const navigate = useNavigate();

  const handleFabClick = () => {
    navigate('/gastos?nuevo=1');
  };

  const renderNavItem = (item: typeof leftItems[0]) => (
    <NavLink
      key={item.to}
      to={item.to}
      className="flex flex-col items-center justify-center gap-1 py-2 px-4 min-w-[64px]"
    >
      {({ isActive }) => (
        <>
          <item.icon
            className={`w-[22px] h-[22px] transition-colors ${
              isActive ? 'text-white' : 'text-purple-400/50'
            }`}
          />
          <span
            className={`text-[11px] font-medium transition-colors ${
              isActive ? 'text-white' : 'text-purple-400/50'
            }`}
          >
            {item.label}
          </span>
          {/* Dot indicator */}
          {isActive && (
            <motion.div
              layoutId="nav-dot"
              className="w-1 h-1 rounded-full bg-pink-500"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      {/* Background gradient fade */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#1a0a2e] to-transparent pointer-events-none" />

      {/* Nav bar container */}
      <div className="relative mx-3 mb-3">
        {/* FAB - Floating Action Button */}
        <motion.button
          onClick={handleFabClick}
          className="absolute left-1/2 -translate-x-1/2 -top-6 z-10 w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
            boxShadow: '0 4px 20px rgba(236, 72, 153, 0.4)',
          }}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
        </motion.button>

        {/* Nav bar */}
        <div
          className="rounded-2xl backdrop-blur-xl border border-purple-500/20"
          style={{ background: 'rgba(26, 10, 46, 0.95)' }}
        >
          <div className="flex items-center justify-between px-2 py-2 pb-[max(8px,env(safe-area-inset-bottom))]">
            {/* Left items */}
            <div className="flex items-center">
              {leftItems.map(renderNavItem)}
            </div>

            {/* Center spacer for FAB */}
            <div className="w-16" />

            {/* Right items */}
            <div className="flex items-center">
              {rightItems.map(renderNavItem)}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

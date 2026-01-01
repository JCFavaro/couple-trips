import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { MagicBackground } from '../ui/MagicBackground';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <MagicBackground />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

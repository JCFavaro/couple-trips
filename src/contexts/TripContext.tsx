import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Trip, TripTheme, TripThemeConfig } from '../types';

interface TripContextType {
  // Current trip
  currentTrip: Trip | null;
  setCurrentTrip: (trip: Trip | null) => void;

  // All trips
  trips: Trip[];
  loading: boolean;

  // Theme
  theme: TripThemeConfig;

  // Actions
  selectTrip: (tripId: string) => void;
  clearTrip: () => void;
  refreshTrips: () => Promise<void>;
  updateTripDolarRate: (rate: number) => Promise<void>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

const DEFAULT_THEME: TripThemeConfig = {
  name: 'Default',
  primary: '#6366f1',
  secondary: '#8b5cf6',
  bg: '#18181b',
  bgGradient: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
  cardBg: 'rgba(99, 102, 241, 0.1)',
  textPrimary: '#ffffff',
  textSecondary: 'rgba(161, 161, 170, 0.8)',
  accent: '#a78bfa',
};

const THEMES: Record<TripTheme, TripThemeConfig> = {
  orlando: {
    name: 'Orlando Magic',
    primary: '#ec4899',
    secondary: '#8b5cf6',
    bg: '#1a0a2e',
    bgGradient: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 100%)',
    cardBg: 'rgba(139, 92, 246, 0.1)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(192, 132, 252, 0.7)',
    accent: '#f472b6',
  },
  chile: {
    name: 'Chile Adventure',
    primary: '#0ea5e9',
    secondary: '#38bdf8',
    bg: '#0c4a6e',
    bgGradient: 'linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)',
    cardBg: 'rgba(255, 255, 255, 0.12)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(186, 230, 253, 0.7)',
    accent: '#7dd3fc',
  },
  default: DEFAULT_THEME,
};

export function TripProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  // Get theme based on current trip
  const theme: TripThemeConfig = currentTrip
    ? THEMES[currentTrip.theme as TripTheme] || DEFAULT_THEME
    : DEFAULT_THEME;

  // Load trips on mount
  useEffect(() => {
    loadTrips();
  }, []);

  // Persist selected trip to localStorage
  useEffect(() => {
    if (currentTrip) {
      localStorage.setItem('selectedTripId', currentTrip.id);
    }
  }, [currentTrip]);

  // Restore selected trip from localStorage
  useEffect(() => {
    const savedTripId = localStorage.getItem('selectedTripId');
    if (savedTripId && trips.length > 0 && !currentTrip) {
      const savedTrip = trips.find(t => t.id === savedTripId);
      if (savedTrip) {
        setCurrentTrip(savedTrip);
      }
    }
  }, [trips]);

  // Apply theme to document via data-theme attribute
  useEffect(() => {
    if (currentTrip) {
      // Set data-theme attribute for CSS variables
      document.documentElement.setAttribute('data-theme', currentTrip.theme);
      // Also update meta theme-color for mobile browsers
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', theme.bg);
      }
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme, currentTrip]);

  async function loadTrips() {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('fecha_inicio', { ascending: true });

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  }

  function selectTrip(tripId: string) {
    const trip = trips.find(t => t.id === tripId);
    if (trip) {
      setCurrentTrip(trip);
    }
  }

  function clearTrip() {
    setCurrentTrip(null);
    localStorage.removeItem('selectedTripId');
  }

  async function refreshTrips() {
    await loadTrips();
  }

  async function updateTripDolarRate(rate: number) {
    if (!currentTrip) return;

    try {
      const { error } = await supabase
        .from('trips')
        .update({ dolar_blue_rate: rate, updated_at: new Date().toISOString() })
        .eq('id', currentTrip.id);

      if (error) throw error;

      // Update local state
      setCurrentTrip({ ...currentTrip, dolar_blue_rate: rate });
      setTrips(trips.map(t =>
        t.id === currentTrip.id ? { ...t, dolar_blue_rate: rate } : t
      ));
    } catch (error) {
      console.error('Error updating dolar rate:', error);
    }
  }

  return (
    <TripContext.Provider
      value={{
        currentTrip,
        setCurrentTrip,
        trips,
        loading,
        theme,
        selectTrip,
        clearTrip,
        refreshTrips,
        updateTripDolarRate,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}

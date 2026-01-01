import { useState, useEffect, useCallback } from 'react';
import { getTripConfig, updateTripConfig, supabase } from '../lib/supabase';
import type { TripConfig } from '../types';
import { getDaysUntilTrip, getCountdownMessage, isOnTrip, isTripOver } from '../lib/utils';

// Default trip config
const DEFAULT_CONFIG: TripConfig = {
  id: '',
  trip_start_date: '2026-05-09',
  trip_end_date: '2026-05-25',
  dolar_blue_rate: 1200,
  updated_at: new Date().toISOString(),
};

export function useTripConfig() {
  const [config, setConfig] = useState<TripConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTripConfig();
      if (data) {
        setConfig(data);
      }
      setError(null);
    } catch (err) {
      setError('Error al cargar la configuracion');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('trip_config-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trip_config' },
        () => {
          fetchConfig();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchConfig]);

  const update = async (data: Partial<TripConfig>): Promise<boolean> => {
    try {
      const result = await updateTripConfig({ ...config, ...data });
      if (result) {
        setConfig(result);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating config:', err);
      return false;
    }
  };

  const daysUntil = getDaysUntilTrip(config.trip_start_date);
  const countdownMessage = getCountdownMessage(daysUntil, config.trip_start_date, config.trip_end_date);
  const onTrip = isOnTrip(config.trip_start_date, config.trip_end_date);
  const tripOver = isTripOver(config.trip_end_date);

  return {
    config,
    loading,
    error,
    daysUntil,
    countdownMessage,
    onTrip,
    tripOver,
    update,
    refresh: fetchConfig,
  };
}

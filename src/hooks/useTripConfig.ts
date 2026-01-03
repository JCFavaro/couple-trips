import { useMemo } from 'react';
import { useTrip } from '../contexts';
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
  const { currentTrip, updateTripDolarRate } = useTrip();

  // Create a config-like object from the current trip for backwards compatibility
  const config: TripConfig = useMemo(() => {
    if (!currentTrip) {
      return DEFAULT_CONFIG;
    }

    return {
      id: currentTrip.id,
      trip_start_date: currentTrip.fecha_inicio,
      trip_end_date: currentTrip.fecha_fin,
      dolar_blue_rate: currentTrip.dolar_blue_rate,
      updated_at: currentTrip.updated_at,
    };
  }, [currentTrip]);

  const daysUntil = getDaysUntilTrip(config.trip_start_date);
  const countdownMessage = getCountdownMessage(daysUntil, config.trip_start_date, config.trip_end_date);
  const onTrip = isOnTrip(config.trip_start_date, config.trip_end_date);
  const tripOver = isTripOver(config.trip_end_date);

  const update = async (data: Partial<TripConfig>): Promise<boolean> => {
    try {
      if (data.dolar_blue_rate !== undefined) {
        await updateTripDolarRate(data.dolar_blue_rate);
      }
      return true;
    } catch (err) {
      console.error('Error updating config:', err);
      return false;
    }
  };

  return {
    config,
    loading: !currentTrip,
    error: null,
    daysUntil,
    countdownMessage,
    onTrip,
    tripOver,
    update,
    refresh: () => {}, // No longer needed - context handles updates
  };
}

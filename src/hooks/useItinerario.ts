import { useState, useEffect, useCallback } from 'react';
import { getItinerario, createItinerario, updateItinerario, deleteItinerario, supabase } from '../lib/supabase';
import { useTrip } from '../contexts';
import type { Itinerario, ItinerarioFormData } from '../types';
import { groupByDate } from '../lib/utils';

export function useItinerario() {
  const { currentTrip } = useTrip();
  const tripId = currentTrip?.id;

  const [items, setItems] = useState<Itinerario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItinerario = useCallback(async () => {
    if (!tripId) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getItinerario(tripId);
      setItems(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar el itinerario');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchItinerario();

    if (!tripId) return;

    // Subscribe to realtime changes
    const subscription = supabase
      .channel(`itinerario-${tripId}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'itinerario', filter: `trip_id=eq.${tripId}` },
        () => {
          fetchItinerario();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchItinerario, tripId]);

  const addItem = async (data: ItinerarioFormData): Promise<boolean> => {
    if (!tripId) return false;
    try {
      const result = await createItinerario(tripId, data);
      if (result) {
        setItems((prev) => [...prev, result].sort((a, b) => {
          const dateCompare = a.fecha.localeCompare(b.fecha);
          if (dateCompare !== 0) return dateCompare;
          return a.orden - b.orden;
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding itinerario:', err);
      return false;
    }
  };

  const editItem = async (id: string, data: Partial<ItinerarioFormData>): Promise<boolean> => {
    try {
      const result = await updateItinerario(id, data);
      if (result) {
        setItems((prev) => prev.map((item) => (item.id === id ? result : item)));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating itinerario:', err);
      return false;
    }
  };

  const removeItem = async (id: string): Promise<boolean> => {
    try {
      const success = await deleteItinerario(id);
      if (success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting itinerario:', err);
      return false;
    }
  };

  const groupedByDate = groupByDate(items);

  return {
    items,
    groupedByDate,
    loading,
    error,
    addItem,
    editItem,
    removeItem,
    refresh: fetchItinerario,
  };
}

import { useState, useEffect, useCallback } from 'react';
import { getLugares, createLugar, updateLugar, deleteLugar, supabase } from '../lib/supabase';
import { useTrip } from '../contexts';
import type { Lugar, LugarFormData, TipoLugar } from '../types';

export function useLugares() {
  const { currentTrip } = useTrip();
  const tripId = currentTrip?.id;

  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLugares = useCallback(async () => {
    if (!tripId) {
      setLugares([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getLugares(tripId);
      setLugares(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los lugares');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchLugares();

    if (!tripId) return;

    // Subscribe to realtime changes
    const subscription = supabase
      .channel(`lugares-${tripId}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lugares', filter: `trip_id=eq.${tripId}` },
        () => {
          fetchLugares();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchLugares, tripId]);

  const addLugar = async (data: LugarFormData): Promise<boolean> => {
    if (!tripId) return false;
    try {
      const result = await createLugar(tripId, data);
      if (result) {
        setLugares((prev) => [result, ...prev]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding lugar:', err);
      return false;
    }
  };

  const editLugar = async (id: string, data: Partial<LugarFormData & { visitado: boolean }>): Promise<boolean> => {
    try {
      const result = await updateLugar(id, data);
      if (result) {
        setLugares((prev) => prev.map((l) => (l.id === id ? result : l)));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating lugar:', err);
      return false;
    }
  };

  const toggleVisitado = async (id: string): Promise<boolean> => {
    const lugar = lugares.find((l) => l.id === id);
    if (!lugar) return false;
    return editLugar(id, { visitado: !lugar.visitado });
  };

  const removeLugar = async (id: string): Promise<boolean> => {
    try {
      const success = await deleteLugar(id);
      if (success) {
        setLugares((prev) => prev.filter((l) => l.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting lugar:', err);
      return false;
    }
  };

  // Group by type
  const byType = lugares.reduce((acc, lugar) => {
    const tipo = lugar.tipo as TipoLugar;
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(lugar);
    return acc;
  }, {} as Record<TipoLugar, Lugar[]>);

  // Stats
  const visitados = lugares.filter((l) => l.visitado).length;
  const pendientes = lugares.filter((l) => !l.visitado).length;

  return {
    lugares,
    byType,
    visitados,
    pendientes,
    loading,
    error,
    addLugar,
    editLugar,
    toggleVisitado,
    removeLugar,
    refresh: fetchLugares,
  };
}

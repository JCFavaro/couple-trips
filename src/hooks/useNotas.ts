import { useState, useEffect, useCallback } from 'react';
import { getNotas, createNota, updateNota, deleteNota, supabase } from '../lib/supabase';
import { useTrip } from '../contexts';
import type { Nota, NotaFormData, TipoNota } from '../types';

export function useNotas() {
  const { currentTrip } = useTrip();
  const tripId = currentTrip?.id;

  const [notas, setNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotas = useCallback(async () => {
    if (!tripId) {
      setNotas([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getNotas(tripId);
      setNotas(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las notas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchNotas();

    if (!tripId) return;

    // Subscribe to realtime changes
    const subscription = supabase
      .channel(`notas-${tripId}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notas', filter: `trip_id=eq.${tripId}` },
        () => {
          fetchNotas();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchNotas, tripId]);

  const addNota = async (data: NotaFormData): Promise<boolean> => {
    if (!tripId) return false;
    try {
      const result = await createNota(tripId, data);
      if (result) {
        setNotas((prev) => [result, ...prev]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding nota:', err);
      return false;
    }
  };

  const editNota = async (id: string, data: Partial<NotaFormData>): Promise<boolean> => {
    try {
      const result = await updateNota(id, data);
      if (result) {
        setNotas((prev) => prev.map((n) => (n.id === id ? result : n)));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating nota:', err);
      return false;
    }
  };

  const removeNota = async (id: string): Promise<boolean> => {
    try {
      const success = await deleteNota(id);
      if (success) {
        setNotas((prev) => prev.filter((n) => n.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting nota:', err);
      return false;
    }
  };

  // Group by type
  const byType = notas.reduce((acc, nota) => {
    const tipo = nota.tipo as TipoNota;
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(nota);
    return acc;
  }, {} as Record<TipoNota, Nota[]>);

  return {
    notas,
    byType,
    loading,
    error,
    addNota,
    editNota,
    removeNota,
    refresh: fetchNotas,
  };
}

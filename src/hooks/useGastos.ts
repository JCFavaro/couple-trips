import { useState, useEffect, useCallback } from 'react';
import { getGastos, createGasto, updateGasto, deleteGasto, supabase } from '../lib/supabase';
import { getDolarBlueRate, arsToUsd } from '../lib/dolarBlue';
import type { Gasto, GastoFormData, Balance } from '../types';
import { calculateBalance } from '../lib/utils';

export function useGastos() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dolarRate, setDolarRate] = useState<number>(1200);

  const fetchGastos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getGastos();
      setGastos(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los gastos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDolarRate = useCallback(async () => {
    const rate = await getDolarBlueRate();
    setDolarRate(rate);
  }, []);

  useEffect(() => {
    fetchGastos();
    fetchDolarRate();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('gastos-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gastos' },
        () => {
          fetchGastos();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchGastos, fetchDolarRate]);

  const addGasto = async (data: GastoFormData): Promise<boolean> => {
    try {
      const montoUsd = data.moneda === 'USD' ? data.monto : arsToUsd(data.monto, dolarRate);
      const result = await createGasto(data, montoUsd);
      if (result) {
        setGastos((prev) => [result, ...prev]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding gasto:', err);
      return false;
    }
  };

  const editGasto = async (id: string, data: Partial<GastoFormData>): Promise<boolean> => {
    try {
      let montoUsd: number | undefined;
      if (data.monto !== undefined && data.moneda) {
        montoUsd = data.moneda === 'USD' ? data.monto : arsToUsd(data.monto, dolarRate);
      }
      const result = await updateGasto(id, data, montoUsd);
      if (result) {
        setGastos((prev) => prev.map((g) => (g.id === id ? result : g)));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating gasto:', err);
      return false;
    }
  };

  const removeGasto = async (id: string): Promise<boolean> => {
    try {
      const success = await deleteGasto(id);
      if (success) {
        setGastos((prev) => prev.filter((g) => g.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting gasto:', err);
      return false;
    }
  };

  const balance: Balance = calculateBalance(gastos);

  return {
    gastos,
    loading,
    error,
    balance,
    dolarRate,
    addGasto,
    editGasto,
    removeGasto,
    refresh: fetchGastos,
    refreshDolarRate: fetchDolarRate,
  };
}

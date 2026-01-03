import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getGastos,
  getGastoPagos,
  createGasto,
  updateGasto,
  deleteGasto,
  createGastoPago,
  deleteGastoPago,
  supabase,
} from '../lib/supabase';
import { arsToUsd } from '../lib/dolarBlue';
import { useTrip } from '../contexts';
import type { Gasto, GastoPago, GastoConPagos, GastoFormData, GastoPagoFormData, Balance } from '../types';
import { calculateBalance } from '../lib/utils';

export function useGastos() {
  const { currentTrip } = useTrip();
  const tripId = currentTrip?.id;
  const dolarRate = currentTrip?.dolar_blue_rate || 1200;

  const [gastosRaw, setGastosRaw] = useState<Gasto[]>([]);
  const [pagos, setPagos] = useState<GastoPago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGastos = useCallback(async () => {
    if (!tripId) {
      setGastosRaw([]);
      setPagos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [gastosData, pagosData] = await Promise.all([
        getGastos(tripId),
        getGastoPagos(tripId),
      ]);
      setGastosRaw(gastosData);
      setPagos(pagosData);
      setError(null);
    } catch (err) {
      setError('Error al cargar los gastos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchGastos();

    if (!tripId) return;

    // Subscribe to realtime changes for gastos (filtered by trip)
    const gastosSubscription = supabase
      .channel(`gastos-${tripId}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gastos', filter: `trip_id=eq.${tripId}` },
        () => {
          fetchGastos();
        }
      )
      .subscribe();

    // Subscribe to realtime changes for gasto_pagos
    const pagosSubscription = supabase
      .channel(`gasto-pagos-${tripId}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gasto_pagos', filter: `trip_id=eq.${tripId}` },
        () => {
          fetchGastos();
        }
      )
      .subscribe();

    return () => {
      gastosSubscription.unsubscribe();
      pagosSubscription.unsubscribe();
    };
  }, [fetchGastos, tripId]);

  // Combinar gastos con sus pagos
  const gastos: GastoConPagos[] = useMemo(() => {
    return gastosRaw.map((gasto) => {
      const gastoPagos = pagos.filter((p) => p.gasto_id === gasto.id);
      const totalPagado = gastoPagos.reduce((sum, p) => sum + p.monto, 0);
      const cuotasPagadas = gastoPagos.length;

      // Calcular pagado por cada persona
      let pagadoJuan = 0;
      let pagadoVale = 0;

      for (const pago of gastoPagos) {
        // Convertir a USD si es necesario para el calculo
        const montoUsd = gasto.moneda === 'USD' ? pago.monto : arsToUsd(pago.monto, dolarRate);
        if (pago.pagador === 'Juan') {
          pagadoJuan += montoUsd;
        } else {
          pagadoVale += montoUsd;
        }
      }

      // Calcular restante y progreso
      const restante = gasto.monto_usd - (pagadoJuan + pagadoVale);
      const progreso = gasto.monto_usd > 0 ? Math.round(((pagadoJuan + pagadoVale) / gasto.monto_usd) * 100) : 0;

      return {
        ...gasto,
        pagos: gastoPagos,
        total_pagado: totalPagado,
        cuotas_pagadas: cuotasPagadas,
        restante: Math.max(0, restante),
        progreso: Math.min(100, progreso),
        pagado_juan: Number(pagadoJuan.toFixed(2)),
        pagado_vale: Number(pagadoVale.toFixed(2)),
      };
    });
  }, [gastosRaw, pagos, dolarRate]);

  const addGasto = async (data: GastoFormData): Promise<boolean> => {
    if (!tripId) return false;
    try {
      const montoUsd = data.moneda === 'USD' ? data.monto : arsToUsd(data.monto, dolarRate);
      const result = await createGasto(tripId, data, montoUsd);
      if (result) {
        await fetchGastos();
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
        await fetchGastos();
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
        await fetchGastos();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting gasto:', err);
      return false;
    }
  };

  // Funciones para pagos de cuotas
  const addPago = async (data: GastoPagoFormData): Promise<boolean> => {
    if (!tripId) return false;
    try {
      const result = await createGastoPago(tripId, data);
      if (result) {
        await fetchGastos();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding pago:', err);
      return false;
    }
  };

  const removePago = async (id: string): Promise<boolean> => {
    try {
      const success = await deleteGastoPago(id);
      if (success) {
        await fetchGastos();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting pago:', err);
      return false;
    }
  };

  // Calcular balance (separado por moneda, sin conversion)
  const balance: Balance = useMemo(() => {
    return calculateBalance(gastos);
  }, [gastos]);

  // Resumen de cuotas pendientes
  const resumenCuotas = useMemo(() => {
    const gastosEnCuotas = gastos.filter((g) => g.cuotas_total > 1);
    const totalAPagar = gastosEnCuotas.reduce((sum, g) => sum + g.monto_usd, 0);
    const totalPagado = gastosEnCuotas.reduce((sum, g) => sum + g.pagado_juan + g.pagado_vale, 0);
    const totalRestante = gastosEnCuotas.reduce((sum, g) => sum + g.restante, 0);
    const progresoGeneral = totalAPagar > 0 ? Math.round((totalPagado / totalAPagar) * 100) : 0;

    return {
      cantidad: gastosEnCuotas.length,
      totalAPagar: Number(totalAPagar.toFixed(2)),
      totalPagado: Number(totalPagado.toFixed(2)),
      totalRestante: Number(totalRestante.toFixed(2)),
      progresoGeneral,
    };
  }, [gastos]);

  return {
    gastos,
    loading,
    error,
    balance,
    dolarRate,
    resumenCuotas,
    addGasto,
    editGasto,
    removeGasto,
    addPago,
    removePago,
    refresh: fetchGastos,
  };
}

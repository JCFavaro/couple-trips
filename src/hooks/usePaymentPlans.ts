import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getPaymentPlans,
  getPayments,
  createPaymentPlan,
  updatePaymentPlan,
  deletePaymentPlan,
  createPayment,
  deletePayment,
  supabase,
} from '../lib/supabase';
import type {
  PaymentPlan,
  Payment,
  PaymentPlanFormData,
  PaymentFormData,
  PaymentPlanWithPayments,
} from '../types';

export function usePaymentPlans() {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [plansData, paymentsData] = await Promise.all([
        getPaymentPlans(),
        getPayments(),
      ]);
      setPlans(plansData);
      setPayments(paymentsData);
      setError(null);
    } catch (err) {
      setError('Error al cargar los planes de pago');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Subscribe to realtime changes for both tables
    const plansSubscription = supabase
      .channel('payment-plans-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payment_plans' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    const paymentsSubscription = supabase
      .channel('payments-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      plansSubscription.unsubscribe();
      paymentsSubscription.unsubscribe();
    };
  }, [fetchData]);

  // Calculate plans with payments data
  const plansWithPayments = useMemo((): PaymentPlanWithPayments[] => {
    return plans.map((plan) => {
      const planPayments = payments.filter((p) => p.plan_id === plan.id);
      const totalPagado = planPayments.reduce((sum, p) => sum + p.monto, 0);
      const cuotasPagadas = planPayments.length;
      const restante = plan.monto_total - totalPagado;
      const progreso = plan.monto_total > 0 ? (totalPagado / plan.monto_total) * 100 : 0;
      const pagadoJuan = planPayments
        .filter((p) => p.pagador === 'Juan')
        .reduce((sum, p) => sum + p.monto, 0);
      const pagadoVale = planPayments
        .filter((p) => p.pagador === 'Vale')
        .reduce((sum, p) => sum + p.monto, 0);

      return {
        ...plan,
        payments: planPayments,
        total_pagado: totalPagado,
        cuotas_pagadas: cuotasPagadas,
        restante: Math.max(0, restante),
        progreso: Math.min(100, progreso),
        pagado_juan: pagadoJuan,
        pagado_vale: pagadoVale,
      };
    });
  }, [plans, payments]);

  // Calculate resumen
  const resumen = useMemo(() => {
    const totalPlanes = plansWithPayments.length;
    const totalAPagar = plansWithPayments.reduce((sum, p) => sum + p.monto_total, 0);
    const totalPagado = plansWithPayments.reduce((sum, p) => sum + p.total_pagado, 0);
    const totalRestante = plansWithPayments.reduce((sum, p) => sum + p.restante, 0);
    const progresoGeneral = totalAPagar > 0 ? (totalPagado / totalAPagar) * 100 : 0;
    const pagadoJuan = plansWithPayments.reduce((sum, p) => sum + p.pagado_juan, 0);
    const pagadoVale = plansWithPayments.reduce((sum, p) => sum + p.pagado_vale, 0);

    return {
      totalPlanes,
      totalAPagar,
      totalPagado,
      totalRestante,
      progresoGeneral: Math.min(100, progresoGeneral),
      pagadoJuan,
      pagadoVale,
    };
  }, [plansWithPayments]);

  const addPlan = async (data: PaymentPlanFormData): Promise<boolean> => {
    try {
      const result = await createPaymentPlan(data);
      if (result) {
        setPlans((prev) => [result, ...prev]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding payment plan:', err);
      return false;
    }
  };

  const editPlan = async (id: string, data: Partial<PaymentPlanFormData>): Promise<boolean> => {
    try {
      const result = await updatePaymentPlan(id, data);
      if (result) {
        setPlans((prev) => prev.map((p) => (p.id === id ? result : p)));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating payment plan:', err);
      return false;
    }
  };

  const removePlan = async (id: string): Promise<boolean> => {
    try {
      const success = await deletePaymentPlan(id);
      if (success) {
        setPlans((prev) => prev.filter((p) => p.id !== id));
        setPayments((prev) => prev.filter((p) => p.plan_id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting payment plan:', err);
      return false;
    }
  };

  const addPayment = async (data: PaymentFormData): Promise<boolean> => {
    try {
      const result = await createPayment(data);
      if (result) {
        setPayments((prev) => [result, ...prev]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding payment:', err);
      return false;
    }
  };

  const removePayment = async (id: string): Promise<boolean> => {
    try {
      const success = await deletePayment(id);
      if (success) {
        setPayments((prev) => prev.filter((p) => p.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting payment:', err);
      return false;
    }
  };

  return {
    plans: plansWithPayments,
    resumen,
    loading,
    error,
    addPlan,
    editPlan,
    removePlan,
    addPayment,
    removePayment,
    refresh: fetchData,
  };
}

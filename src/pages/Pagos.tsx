import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Edit2,
  CreditCard,
  Hotel,
  Plane,
  Car,
  Shield,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  Castle,
  MoreHorizontal,
  Wallet,
  AlertCircle,
} from 'lucide-react';
import { PageWrapper } from '../components/layout';
import { Button, Input, Select, Modal, ConfirmModal, Textarea } from '../components/ui';
import { usePaymentPlans, useBalance } from '../hooks';
import { formatCurrency, formatDate } from '../lib/utils';
import type {
  CategoriaPlan,
  PaymentPlanFormData,
  PaymentFormData,
  PaymentPlanWithPayments,
  Pagador,
  Moneda,
} from '../types';

const CATEGORIA_ICONS: Record<CategoriaPlan, typeof Hotel> = {
  hotel: Hotel,
  vuelos: Plane,
  parques: Castle,
  transporte: Car,
  seguro: Shield,
  otros: MoreHorizontal,
};

const CATEGORIA_COLORS: Record<CategoriaPlan, string> = {
  hotel: 'from-purple-500/30 to-violet-500/30 text-purple-300 border-purple-500/30',
  vuelos: 'from-blue-500/30 to-cyan-500/30 text-blue-300 border-blue-500/30',
  parques: 'from-pink-500/30 to-rose-500/30 text-pink-300 border-pink-500/30',
  transporte: 'from-green-500/30 to-emerald-500/30 text-green-300 border-green-500/30',
  seguro: 'from-yellow-500/30 to-amber-500/30 text-yellow-300 border-yellow-500/30',
  otros: 'from-gray-500/30 to-slate-500/30 text-gray-300 border-gray-500/30',
};

const CATEGORIA_OPTIONS = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'vuelos', label: 'Vuelos' },
  { value: 'parques', label: 'Parques' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'seguro', label: 'Seguro' },
  { value: 'otros', label: 'Otros' },
];

const PAGADOR_OPTIONS = [
  { value: 'Juan', label: 'Juan' },
  { value: 'Vale', label: 'Vale' },
];

const MONEDA_OPTIONS = [
  { value: 'USD', label: 'USD' },
  { value: 'ARS', label: 'ARS' },
];

export function Pagos() {
  const { plans, resumen, loading, addPlan, editPlan, removePlan, addPayment, removePayment } =
    usePaymentPlans();
  const { balance: balanceTotal } = useBalance();
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeletePaymentModal, setShowDeletePaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlanWithPayments | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Plan form state
  const [planForm, setPlanForm] = useState<PaymentPlanFormData>({
    nombre: '',
    descripcion: '',
    categoria: 'hotel',
    monto_total: 0,
    cuotas_total: 1,
    fecha_inicio: '',
    moneda: 'USD',
    notas: '',
  });

  // Payment form state
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    plan_id: '',
    numero_cuota: 1,
    monto: 0,
    pagador: 'Juan',
    fecha_pago: new Date().toISOString().split('T')[0],
    notas: '',
  });

  const resetPlanForm = () => {
    setPlanForm({
      nombre: '',
      descripcion: '',
      categoria: 'hotel',
      monto_total: 0,
      cuotas_total: 1,
      fecha_inicio: '',
      moneda: 'USD',
      notas: '',
    });
    setSelectedPlan(null);
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      plan_id: '',
      numero_cuota: 1,
      monto: 0,
      pagador: 'Juan',
      fecha_pago: new Date().toISOString().split('T')[0],
      notas: '',
    });
  };

  const handleOpenPlanModal = (plan?: PaymentPlanWithPayments) => {
    if (plan) {
      setSelectedPlan(plan);
      setPlanForm({
        nombre: plan.nombre,
        descripcion: plan.descripcion || '',
        categoria: plan.categoria,
        monto_total: plan.monto_total,
        cuotas_total: plan.cuotas_total,
        fecha_inicio: plan.fecha_inicio || '',
        moneda: plan.moneda,
        notas: plan.notas || '',
      });
    } else {
      resetPlanForm();
    }
    setShowPlanModal(true);
  };

  const handleClosePlanModal = () => {
    setShowPlanModal(false);
    resetPlanForm();
  };

  const handleOpenPaymentModal = (plan: PaymentPlanWithPayments) => {
    const nextCuota = plan.cuotas_pagadas + 1;
    const suggestedMonto = plan.cuotas_total > 0 ? plan.monto_total / plan.cuotas_total : 0;
    setPaymentForm({
      plan_id: plan.id,
      numero_cuota: nextCuota,
      monto: Math.round(suggestedMonto * 100) / 100,
      pagador: 'Juan',
      fecha_pago: new Date().toISOString().split('T')[0],
      notas: '',
    });
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    resetPaymentForm();
  };

  const handleSubmitPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.nombre || planForm.monto_total <= 0) return;

    setIsSubmitting(true);
    try {
      if (selectedPlan) {
        await editPlan(selectedPlan.id, planForm);
      } else {
        await addPlan(planForm);
      }
      handleClosePlanModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.plan_id || paymentForm.monto <= 0) return;

    setIsSubmitting(true);
    try {
      await addPayment(paymentForm);
      handleClosePaymentModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!deletePlanId) return;
    await removePlan(deletePlanId);
    setDeletePlanId(null);
  };

  const handleDeletePayment = async () => {
    if (!deletePaymentId) return;
    await removePayment(deletePaymentId);
    setDeletePaymentId(null);
  };

  const confirmDeletePlan = (id: string) => {
    setDeletePlanId(id);
    setShowDeleteModal(true);
  };

  const confirmDeletePayment = (id: string) => {
    setDeletePaymentId(id);
    setShowDeletePaymentModal(true);
  };

  const toggleExpanded = (planId: string) => {
    setExpandedPlanId(expandedPlanId === planId ? null : planId);
  };

  const getProgressGradient = (progreso: number): string => {
    if (progreso >= 100) return 'linear-gradient(90deg, #4ade80, #22c55e)';
    if (progreso >= 50) return 'linear-gradient(90deg, #eab308, #f59e0b)';
    return 'linear-gradient(90deg, #ec4899, #a855f7)';
  };

  return (
    <PageWrapper
      title="Pagos"
      subtitle={`${plans.length} planes de pago`}
      rightAction={
        <motion.button
          onClick={() => handleOpenPlanModal()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '16px 28px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, #ec4899, #a855f7)',
            color: 'white',
            fontWeight: 600,
            fontSize: 16,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(236, 72, 153, 0.4)',
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus style={{ width: 20, height: 20 }} />
          Nuevo
        </motion.button>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{ display: 'inline-block' }}
          >
            <Sparkles style={{ width: 40, height: 40, color: '#f472b6' }} />
          </motion.div>
          <p style={{ color: 'rgba(192, 132, 252, 0.5)', marginTop: 16 }}>Cargando...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Resumen Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 16,
            }}
          >
            {/* Total */}
            <motion.div
              className="glass-card"
              style={{ padding: 20 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p style={{ fontSize: 13, color: 'rgba(192, 132, 252, 0.6)', marginBottom: 8 }}>
                Total a pagar
              </p>
              <p style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>
                {formatCurrency(resumen.totalAPagar, 'USD')}
              </p>
            </motion.div>

            {/* Pagado */}
            <motion.div
              className="glass-card"
              style={{ padding: 20 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <p style={{ fontSize: 13, color: 'rgba(192, 132, 252, 0.6)', marginBottom: 8 }}>
                Pagado
              </p>
              <p style={{ fontSize: 24, fontWeight: 700, color: '#4ade80' }}>
                {formatCurrency(resumen.totalPagado, 'USD')}
              </p>
              <p style={{ fontSize: 12, color: 'rgba(192, 132, 252, 0.5)', marginTop: 4 }}>
                {resumen.progresoGeneral.toFixed(0)}% completado
              </p>
            </motion.div>

            {/* Juan */}
            <motion.div
              className="glass-card"
              style={{ padding: 20 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p style={{ fontSize: 13, color: 'rgba(96, 165, 250, 0.8)', marginBottom: 8 }}>
                Juan
              </p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#60a5fa' }}>
                {formatCurrency(resumen.pagadoJuan, 'USD')}
              </p>
            </motion.div>

            {/* Vale */}
            <motion.div
              className="glass-card"
              style={{ padding: 20 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <p style={{ fontSize: 13, color: 'rgba(244, 114, 182, 0.8)', marginBottom: 8 }}>
                Vale
              </p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#f472b6' }}>
                {formatCurrency(resumen.pagadoVale, 'USD')}
              </p>
            </motion.div>
          </div>

          {/* Restante Total */}
          {resumen.totalRestante > 0 && (
            <motion.div
              className="glass-card"
              style={{ padding: 20 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  padding: 10,
                  borderRadius: 12,
                  background: 'rgba(251, 191, 36, 0.2)',
                }}>
                  <AlertCircle style={{ width: 20, height: 20, color: '#fbbf24' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: 'rgba(251, 191, 36, 0.8)', marginBottom: 4 }}>
                    Total restante por pagar
                  </p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: '#fbbf24' }}>
                    {formatCurrency(resumen.totalRestante, 'USD')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Balance Unificado (quien debe a quien) */}
          {balanceTotal.deudor && balanceTotal.diferencia > 0 && (
            <motion.div
              className="glass-card"
              style={{ padding: 20 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  padding: 10,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(168, 85, 247, 0.2))',
                }}>
                  <Wallet style={{ width: 20, height: 20, color: '#f472b6' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, color: 'rgba(192, 132, 252, 0.6)', marginBottom: 4 }}>
                    Balance total (gastos + cuotas)
                  </p>
                  <p style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: balanceTotal.deudor === 'Juan' ? '#60a5fa' : '#f472b6'
                  }}>
                    {balanceTotal.deudor} debe {formatCurrency(balanceTotal.diferencia)} a {balanceTotal.deudor === 'Juan' ? 'Vale' : 'Juan'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Progress bar general */}
          {resumen.totalAPagar > 0 && (
            <motion.div
              className="glass-card"
              style={{ padding: 20 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 14, color: 'rgba(192, 132, 252, 0.7)' }}>
                  Progreso general
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>
                  {resumen.progresoGeneral.toFixed(0)}%
                </span>
              </div>
              <div
                style={{
                  height: 12,
                  background: 'rgba(139, 92, 246, 0.2)',
                  borderRadius: 999,
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${resumen.progresoGeneral}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: getProgressGradient(resumen.progresoGeneral),
                    borderRadius: 999,
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* Lista de planes */}
          {plans.length === 0 ? (
            <motion.div
              className="glass-card"
              style={{ padding: 40, textAlign: 'center' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CreditCard
                style={{
                  width: 56,
                  height: 56,
                  margin: '0 auto',
                  color: 'rgba(168, 85, 247, 0.3)',
                  marginBottom: 16,
                }}
              />
              <p style={{ color: 'rgba(192, 132, 252, 0.6)', fontSize: 18 }}>
                No hay planes de pago
              </p>
              <p style={{ color: 'rgba(168, 85, 247, 0.4)', fontSize: 14, marginTop: 8 }}>
                Crea tu primer plan para trackear pagos
              </p>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <AnimatePresence mode="popLayout">
                {plans.map((plan, index) => {
                  const Icon = CATEGORIA_ICONS[plan.categoria];
                  const isExpanded = expandedPlanId === plan.id;
                  const isComplete = plan.progreso >= 100;

                  return (
                    <motion.div
                      key={plan.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div
                        className="glass-card"
                        style={{
                          padding: 20,
                          borderColor: isComplete ? 'rgba(74, 222, 128, 0.3)' : undefined,
                        }}
                      >
                        {/* Header */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 16,
                          }}
                        >
                          <div
                            className={`p-3 rounded-xl bg-gradient-to-br ${CATEGORIA_COLORS[plan.categoria]} border`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                marginBottom: 4,
                              }}
                            >
                              <p
                                style={{
                                  fontWeight: 600,
                                  color: 'white',
                                  fontSize: 16,
                                }}
                              >
                                {plan.nombre}
                              </p>
                              {isComplete && (
                                <div
                                  style={{
                                    background: 'rgba(74, 222, 128, 0.2)',
                                    borderRadius: 999,
                                    padding: '4px 8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                  }}
                                >
                                  <Check style={{ width: 12, height: 12, color: '#4ade80' }} />
                                  <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 600 }}>
                                    PAGADO
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Progress bar */}
                            <div
                              style={{
                                height: 8,
                                background: 'rgba(139, 92, 246, 0.2)',
                                borderRadius: 999,
                                overflow: 'hidden',
                                marginBottom: 8,
                              }}
                            >
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${plan.progreso}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                style={{
                                  height: '100%',
                                  background: getProgressGradient(plan.progreso),
                                  borderRadius: 999,
                                }}
                              />
                            </div>

                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <span style={{ fontSize: 13, color: 'rgba(192, 132, 252, 0.6)' }}>
                                {plan.cuotas_pagadas}/{plan.cuotas_total} cuotas -{' '}
                                {plan.progreso.toFixed(0)}%
                              </span>
                              <span style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>
                                {formatCurrency(plan.total_pagado, plan.moneda)} /{' '}
                                {formatCurrency(plan.monto_total, plan.moneda)}
                              </span>
                            </div>

                            {/* Monto restante */}
                            {!isComplete && plan.restante > 0 && (
                              <div
                                style={{
                                  marginTop: 10,
                                  padding: '8px 12px',
                                  background: 'rgba(251, 191, 36, 0.1)',
                                  borderRadius: 10,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                }}
                              >
                                <span style={{ fontSize: 12, color: 'rgba(251, 191, 36, 0.8)' }}>
                                  Restante:
                                </span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#fbbf24' }}>
                                  {formatCurrency(plan.restante, plan.moneda)}
                                </span>
                              </div>
                            )}

                            {/* Juan / Vale breakdown */}
                            <div
                              style={{
                                display: 'flex',
                                gap: 16,
                                marginTop: 12,
                                fontSize: 13,
                              }}
                            >
                              <span style={{ color: '#60a5fa' }}>
                                Juan: {formatCurrency(plan.pagado_juan, plan.moneda)}
                              </span>
                              <span style={{ color: '#f472b6' }}>
                                Vale: {formatCurrency(plan.pagado_vale, plan.moneda)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: 16,
                            paddingTop: 16,
                            borderTop: '1px solid rgba(139, 92, 246, 0.2)',
                          }}
                        >
                          <div style={{ display: 'flex', gap: 8 }}>
                            <motion.button
                              onClick={() => toggleExpanded(plan.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '10px 16px',
                                borderRadius: 12,
                                background: 'rgba(139, 92, 246, 0.15)',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                color: 'rgba(192, 132, 252, 0.8)',
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: 'pointer',
                              }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp style={{ width: 16, height: 16 }} />
                                  Ocultar
                                </>
                              ) : (
                                <>
                                  <ChevronDown style={{ width: 16, height: 16 }} />
                                  Ver pagos
                                </>
                              )}
                            </motion.button>
                            <motion.button
                              onClick={() => handleOpenPlanModal(plan)}
                              style={{
                                padding: 10,
                                borderRadius: 12,
                                background: 'rgba(139, 92, 246, 0.15)',
                                border: 'none',
                                color: 'rgba(192, 132, 252, 0.7)',
                                cursor: 'pointer',
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Edit2 style={{ width: 16, height: 16 }} />
                            </motion.button>
                            <motion.button
                              onClick={() => confirmDeletePlan(plan.id)}
                              style={{
                                padding: 10,
                                borderRadius: 12,
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: 'none',
                                color: 'rgba(248, 113, 113, 0.7)',
                                cursor: 'pointer',
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 style={{ width: 16, height: 16 }} />
                            </motion.button>
                          </div>

                          {!isComplete && (
                            <motion.button
                              onClick={() => handleOpenPaymentModal(plan)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '10px 16px',
                                borderRadius: 12,
                                background: 'linear-gradient(135deg, #ec4899, #a855f7)',
                                border: 'none',
                                color: 'white',
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
                              }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Plus style={{ width: 16, height: 16 }} />
                              Cuota
                            </motion.button>
                          )}
                        </div>

                        {/* Expanded payments list */}
                        <AnimatePresence>
                          {isExpanded && plan.payments.length > 0 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div
                                style={{
                                  marginTop: 16,
                                  paddingTop: 16,
                                  borderTop: '1px solid rgba(139, 92, 246, 0.2)',
                                }}
                              >
                                <p
                                  style={{
                                    fontSize: 13,
                                    color: 'rgba(192, 132, 252, 0.6)',
                                    marginBottom: 12,
                                  }}
                                >
                                  Historial de pagos
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                  {[...plan.payments]
                                    .sort((a, b) => new Date(b.fecha_pago).getTime() - new Date(a.fecha_pago).getTime())
                                    .map((payment) => (
                                    <div
                                      key={payment.id}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: 12,
                                        background: 'rgba(139, 92, 246, 0.1)',
                                        borderRadius: 12,
                                      }}
                                    >
                                      <div>
                                        <p style={{ fontSize: 14, color: 'white', fontWeight: 500 }}>
                                          Cuota #{payment.numero_cuota}
                                        </p>
                                        <p style={{ fontSize: 12, color: 'rgba(192, 132, 252, 0.5)' }}>
                                          {formatDate(payment.fecha_pago)} -{' '}
                                          <span
                                            style={{
                                              color:
                                                payment.pagador === 'Juan' ? '#60a5fa' : '#f472b6',
                                            }}
                                          >
                                            {payment.pagador}
                                          </span>
                                        </p>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span
                                          style={{ fontSize: 15, fontWeight: 600, color: '#4ade80' }}
                                        >
                                          {formatCurrency(payment.monto, plan.moneda)}
                                        </span>
                                        <motion.button
                                          onClick={() => confirmDeletePayment(payment.id)}
                                          style={{
                                            padding: 8,
                                            borderRadius: 8,
                                            background: 'rgba(239, 68, 68, 0.15)',
                                            border: 'none',
                                            color: 'rgba(248, 113, 113, 0.7)',
                                            cursor: 'pointer',
                                          }}
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                        >
                                          <Trash2 style={{ width: 14, height: 14 }} />
                                        </motion.button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {isExpanded && plan.payments.length === 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                              marginTop: 16,
                              paddingTop: 16,
                              borderTop: '1px solid rgba(139, 92, 246, 0.2)',
                              textAlign: 'center',
                            }}
                          >
                            <p style={{ fontSize: 14, color: 'rgba(192, 132, 252, 0.5)' }}>
                              Sin pagos registrados
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Plan Modal */}
      <Modal
        isOpen={showPlanModal}
        onClose={handleClosePlanModal}
        title={selectedPlan ? 'Editar plan' : 'Nuevo plan de pago'}
      >
        <form onSubmit={handleSubmitPlan} className="space-y-5">
          <Input
            label="Nombre"
            placeholder="Ej: Hotel Disney All-Star"
            value={planForm.nombre}
            onChange={(e) => setPlanForm({ ...planForm, nombre: e.target.value })}
            required
          />

          <Textarea
            label="Descripcion (opcional)"
            placeholder="Detalles del plan..."
            value={planForm.descripcion}
            onChange={(e) => setPlanForm({ ...planForm, descripcion: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Categoria"
              options={CATEGORIA_OPTIONS}
              value={planForm.categoria}
              onChange={(e) =>
                setPlanForm({ ...planForm, categoria: e.target.value as CategoriaPlan })
              }
            />
            <Select
              label="Moneda"
              options={MONEDA_OPTIONS}
              value={planForm.moneda}
              onChange={(e) => setPlanForm({ ...planForm, moneda: e.target.value as Moneda })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Monto total"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={planForm.monto_total || ''}
              onChange={(e) =>
                setPlanForm({ ...planForm, monto_total: parseFloat(e.target.value) || 0 })
              }
              required
            />
            <Input
              label="Cuotas"
              type="number"
              min="1"
              placeholder="1"
              value={planForm.cuotas_total || ''}
              onChange={(e) =>
                setPlanForm({ ...planForm, cuotas_total: parseInt(e.target.value) || 1 })
              }
              required
            />
          </div>

          <Input
            label="Fecha inicio (opcional)"
            type="date"
            value={planForm.fecha_inicio}
            onChange={(e) => setPlanForm({ ...planForm, fecha_inicio: e.target.value })}
          />

          <div style={{ display: 'flex', gap: 16, paddingTop: 20 }}>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handleClosePlanModal}
              style={{ flex: 1 }}
            >
              Cancelar
            </Button>
            <Button type="submit" size="lg" isLoading={isSubmitting} style={{ flex: 1 }}>
              {selectedPlan ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={showPaymentModal} onClose={handleClosePaymentModal} title="Registrar pago">
        <form onSubmit={handleSubmitPayment} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cuota #"
              type="number"
              min="1"
              value={paymentForm.numero_cuota}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, numero_cuota: parseInt(e.target.value) || 1 })
              }
              required
            />
            <Input
              label="Monto"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={paymentForm.monto || ''}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, monto: parseFloat(e.target.value) || 0 })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Pagador"
              options={PAGADOR_OPTIONS}
              value={paymentForm.pagador}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, pagador: e.target.value as Pagador })
              }
            />
            <Input
              label="Fecha"
              type="date"
              value={paymentForm.fecha_pago}
              onChange={(e) => setPaymentForm({ ...paymentForm, fecha_pago: e.target.value })}
              required
            />
          </div>

          <Textarea
            label="Notas (opcional)"
            placeholder="Notas adicionales..."
            value={paymentForm.notas}
            onChange={(e) => setPaymentForm({ ...paymentForm, notas: e.target.value })}
          />

          <div style={{ display: 'flex', gap: 16, paddingTop: 20 }}>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handleClosePaymentModal}
              style={{ flex: 1 }}
            >
              Cancelar
            </Button>
            <Button type="submit" size="lg" isLoading={isSubmitting} style={{ flex: 1 }}>
              Registrar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Plan Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeletePlan}
        title="Eliminar plan"
        message="Estas seguro de que quieres eliminar este plan? Se eliminaran todos los pagos asociados."
        confirmText="Eliminar"
      />

      {/* Delete Payment Confirmation */}
      <ConfirmModal
        isOpen={showDeletePaymentModal}
        onClose={() => setShowDeletePaymentModal(false)}
        onConfirm={handleDeletePayment}
        title="Eliminar pago"
        message="Estas seguro de que quieres eliminar este pago?"
        confirmText="Eliminar"
      />
    </PageWrapper>
  );
}

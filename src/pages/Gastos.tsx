import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, TrendingUp, Plane, Hotel, Ticket, UtensilsCrossed, Car, ShoppingBag, MoreHorizontal, Sparkles, DollarSign, Heart, ChevronDown, ChevronUp, CreditCard } from 'lucide-react';
import { PageWrapper } from '../components/layout';
import { Button, Input, Select, Modal, ConfirmModal } from '../components/ui';
import { useGastos } from '../hooks';
import { formatCurrency, formatDate } from '../lib/utils';
import { getFormattedRate } from '../lib/dolarBlue';
import type { GastoConPagos, GastoFormData, GastoPagoFormData, CategoriaGasto, Pagador, Moneda } from '../types';

const CATEGORIA_ICONS: Record<CategoriaGasto, typeof Plane> = {
  vuelos: Plane,
  estadia: Hotel,
  parques: Ticket,
  comida: UtensilsCrossed,
  transporte: Car,
  compras: ShoppingBag,
  otros: MoreHorizontal,
};

const CATEGORIA_COLORS: Record<CategoriaGasto, { bg: string; text: string; border: string }> = {
  vuelos: { bg: 'rgba(59, 130, 246, 0.3)', text: '#93c5fd', border: 'rgba(59, 130, 246, 0.3)' },
  estadia: { bg: 'rgba(168, 85, 247, 0.3)', text: '#c4b5fd', border: 'rgba(168, 85, 247, 0.3)' },
  parques: { bg: 'rgba(236, 72, 153, 0.3)', text: '#f9a8d4', border: 'rgba(236, 72, 153, 0.3)' },
  comida: { bg: 'rgba(249, 115, 22, 0.3)', text: '#fdba74', border: 'rgba(249, 115, 22, 0.3)' },
  transporte: { bg: 'rgba(34, 197, 94, 0.3)', text: '#86efac', border: 'rgba(34, 197, 94, 0.3)' },
  compras: { bg: 'rgba(234, 179, 8, 0.3)', text: '#fde047', border: 'rgba(234, 179, 8, 0.3)' },
  otros: { bg: 'rgba(107, 114, 128, 0.3)', text: '#d1d5db', border: 'rgba(107, 114, 128, 0.3)' },
};

const CATEGORIA_OPTIONS = [
  { value: 'vuelos', label: 'Vuelos' },
  { value: 'estadia', label: 'Estadia' },
  { value: 'parques', label: 'Parques' },
  { value: 'comida', label: 'Comida' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'compras', label: 'Compras' },
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

export function Gastos() {
  const { gastos, balance, dolarRate, resumenCuotas, loading, addGasto, editGasto, removeGasto, addPago, removePago } = useGastos();
  const [showModal, setShowModal] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeletePagoModal, setShowDeletePagoModal] = useState(false);
  const [selectedGasto, setSelectedGasto] = useState<GastoConPagos | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletePagoId, setDeletePagoId] = useState<string | null>(null);
  const [expandedGasto, setExpandedGasto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tipoPago, setTipoPago] = useState<'unico' | 'cuotas'>('unico');

  const [formData, setFormData] = useState<GastoFormData>({
    fecha: new Date().toISOString().split('T')[0],
    concepto: '',
    categoria: 'otros',
    pagador: 'Juan',
    monto: 0,
    moneda: 'USD',
    cuotas_total: 1,
    descripcion: '',
  });

  const [pagoFormData, setPagoFormData] = useState<Omit<GastoPagoFormData, 'gasto_id'>>({
    numero_cuota: 1,
    monto: 0,
    pagador: 'Juan',
    fecha_pago: new Date().toISOString().split('T')[0],
    notas: '',
  });

  const resetForm = () => {
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      concepto: '',
      categoria: 'otros',
      pagador: 'Juan',
      monto: 0,
      moneda: 'USD',
      cuotas_total: 1,
      descripcion: '',
    });
    setTipoPago('unico');
    setSelectedGasto(null);
  };

  const resetPagoForm = () => {
    setPagoFormData({
      numero_cuota: 1,
      monto: 0,
      pagador: 'Juan',
      fecha_pago: new Date().toISOString().split('T')[0],
      notas: '',
    });
  };

  const handleOpenModal = (gasto?: GastoConPagos) => {
    if (gasto) {
      setSelectedGasto(gasto);
      setTipoPago(gasto.cuotas_total > 1 ? 'cuotas' : 'unico');
      setFormData({
        fecha: gasto.fecha,
        concepto: gasto.concepto,
        categoria: gasto.categoria,
        pagador: gasto.pagador || 'Juan',
        monto: gasto.monto,
        moneda: gasto.moneda,
        cuotas_total: gasto.cuotas_total,
        descripcion: gasto.descripcion || '',
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleOpenPagoModal = (gasto: GastoConPagos) => {
    setSelectedGasto(gasto);
    const nextCuota = gasto.cuotas_pagadas + 1;
    const montoPorCuota = gasto.monto / gasto.cuotas_total;
    setPagoFormData({
      numero_cuota: nextCuota,
      monto: Number(montoPorCuota.toFixed(2)),
      pagador: 'Juan',
      fecha_pago: new Date().toISOString().split('T')[0],
      notas: '',
    });
    setShowPagoModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleClosePagoModal = () => {
    setShowPagoModal(false);
    setSelectedGasto(null);
    resetPagoForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.concepto || formData.monto <= 0) return;

    const dataToSubmit = {
      ...formData,
      cuotas_total: tipoPago === 'cuotas' ? formData.cuotas_total : 1,
      pagador: tipoPago === 'unico' ? formData.pagador : undefined,
    };

    setIsSubmitting(true);
    try {
      if (selectedGasto) {
        await editGasto(selectedGasto.id, dataToSubmit);
      } else {
        await addGasto(dataToSubmit);
      }
      handleCloseModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitPago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGasto || pagoFormData.monto <= 0) return;

    setIsSubmitting(true);
    try {
      await addPago({
        ...pagoFormData,
        gasto_id: selectedGasto.id,
      });
      handleClosePagoModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await removeGasto(deleteId);
    setDeleteId(null);
  };

  const handleDeletePago = async () => {
    if (!deletePagoId) return;
    await removePago(deletePagoId);
    setDeletePagoId(null);
    setShowDeletePagoModal(false);
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDeletePago = (id: string) => {
    setDeletePagoId(id);
    setShowDeletePagoModal(true);
  };

  const toggleExpanded = (id: string) => {
    setExpandedGasto(expandedGasto === id ? null : id);
  };

  const byCategory = gastos.reduce((acc, gasto) => {
    acc[gasto.categoria] = (acc[gasto.categoria] || 0) + gasto.monto_usd;
    return acc;
  }, {} as Record<CategoriaGasto, number>);

  const totalByCategory = Object.values(byCategory).reduce((sum, val) => sum + val, 0);

  return (
    <PageWrapper
      title="Gastos"
      subtitle={`Dolar Blue: ${getFormattedRate()}`}
      rightAction={
        <motion.button
          onClick={() => handleOpenModal()}
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
            boxShadow: '0 8px 24px rgba(236, 72, 153, 0.4)'
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus style={{ width: 20, height: 20 }} />
          Agregar
        </motion.button>
      }
    >
      {/* Balance Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 48 }}
      >
        <div className="glass-card" style={{ padding: 28, position: 'relative', overflow: 'hidden' }}>
          <Sparkles className="sparkle" style={{ position: 'absolute', top: 16, right: 16, width: 20, height: 20, color: 'rgba(244, 114, 182, 0.4)' }} />
          <DollarSign style={{ position: 'absolute', bottom: 16, left: 16, width: 32, height: 32, color: 'rgba(168, 85, 247, 0.2)' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                padding: 14,
                borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(168, 85, 247, 0.3))'
              }}>
                <TrendingUp style={{ width: 24, height: 24, color: '#f9a8d4' }} />
              </div>
              <span style={{ fontWeight: 500, color: '#e9d5ff', fontSize: 18 }}>Balance Total</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <motion.span
                className="shimmer-text"
                style={{ fontSize: 28, fontWeight: 700, display: 'block' }}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {formatCurrency(balance.totalGeneral.usd)}
              </motion.span>
              {balance.totalGeneral.ars > 0 && (
                <span style={{ fontSize: 16, color: 'rgba(192, 132, 252, 0.7)' }}>
                  + {formatCurrency(balance.totalGeneral.ars, 'ARS')}
                </span>
              )}
            </div>
          </div>

          {/* Balance USD */}
          {balance.usd.total > 0 && (
            <>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'rgba(74, 222, 128, 0.8)', fontWeight: 600 }}>DOLARES (USD)</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{
                  textAlign: 'center',
                  padding: 16,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.1))',
                  border: '1px solid rgba(236, 72, 153, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                    <Heart style={{ width: 14, height: 14, fill: '#f472b6', color: '#f472b6' }} />
                    <p style={{ color: 'rgba(192, 132, 252, 0.7)', fontSize: 13, fontWeight: 500 }}>Juan</p>
                  </div>
                  <p style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{formatCurrency(balance.usd.juan)}</p>
                </div>
                <div style={{
                  textAlign: 'center',
                  padding: 16,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))',
                  border: '1px solid rgba(168, 85, 247, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                    <Heart style={{ width: 14, height: 14, fill: '#a855f7', color: '#a855f7' }} />
                    <p style={{ color: 'rgba(192, 132, 252, 0.7)', fontSize: 13, fontWeight: 500 }}>Vale</p>
                  </div>
                  <p style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{formatCurrency(balance.usd.vale)}</p>
                </div>
              </div>
              {balance.usd.deudor && (
                <div style={{
                  padding: 12,
                  borderRadius: 12,
                  background: 'rgba(74, 222, 128, 0.1)',
                  border: '1px solid rgba(74, 222, 128, 0.2)',
                  marginBottom: balance.ars.total > 0 ? 20 : 16,
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: 13, color: '#4ade80' }}>
                    <span style={{ fontWeight: 600 }}>{balance.usd.deudor}</span> debe{' '}
                    <span style={{ fontWeight: 600 }}>{formatCurrency(balance.usd.diferencia)}</span> a{' '}
                    <span style={{ fontWeight: 600 }}>{balance.usd.deudor === 'Juan' ? 'Vale' : 'Juan'}</span>
                  </span>
                </div>
              )}
            </>
          )}

          {/* Balance ARS */}
          {balance.ars.total > 0 && (
            <>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'rgba(59, 130, 246, 0.8)', fontWeight: 600 }}>PESOS (ARS)</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{
                  textAlign: 'center',
                  padding: 16,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                    <Heart style={{ width: 14, height: 14, fill: '#f472b6', color: '#f472b6' }} />
                    <p style={{ color: 'rgba(192, 132, 252, 0.7)', fontSize: 13, fontWeight: 500 }}>Juan</p>
                  </div>
                  <p style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{formatCurrency(balance.ars.juan, 'ARS')}</p>
                </div>
                <div style={{
                  textAlign: 'center',
                  padding: 16,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                    <Heart style={{ width: 14, height: 14, fill: '#a855f7', color: '#a855f7' }} />
                    <p style={{ color: 'rgba(192, 132, 252, 0.7)', fontSize: 13, fontWeight: 500 }}>Vale</p>
                  </div>
                  <p style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{formatCurrency(balance.ars.vale, 'ARS')}</p>
                </div>
              </div>
              {balance.ars.deudor && (
                <div style={{
                  padding: 12,
                  borderRadius: 12,
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  marginBottom: 16,
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: 13, color: '#60a5fa' }}>
                    <span style={{ fontWeight: 600 }}>{balance.ars.deudor}</span> debe{' '}
                    <span style={{ fontWeight: 600 }}>{formatCurrency(balance.ars.diferencia, 'ARS')}</span> a{' '}
                    <span style={{ fontWeight: 600 }}>{balance.ars.deudor === 'Juan' ? 'Vale' : 'Juan'}</span>
                  </span>
                </div>
              )}
            </>
          )}

          {/* Resumen de cuotas pendientes */}
          {resumenCuotas.cantidad > 0 && (
            <motion.div
              style={{
                padding: 16,
                borderRadius: 14,
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.2)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <CreditCard style={{ width: 18, height: 18, color: '#a855f7' }} />
                <span style={{ fontSize: 14, color: '#c4b5fd', fontWeight: 500 }}>
                  {resumenCuotas.cantidad} gasto{resumenCuotas.cantidad > 1 ? 's' : ''} en cuotas
                </span>
              </div>
              <div>
                <div style={{ height: 8, borderRadius: 4, background: 'rgba(168, 85, 247, 0.1)', overflow: 'hidden' }}>
                  <motion.div
                    style={{
                      height: '100%',
                      borderRadius: 4,
                      background: 'linear-gradient(to right, #a855f7, #ec4899)'
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${resumenCuotas.progresoGeneral}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div style={{ textAlign: 'center', marginTop: 6 }}>
                  <span style={{ fontSize: 12, color: 'rgba(196, 181, 253, 0.8)' }}>
                    {resumenCuotas.progresoGeneral}% completado
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Category Summary */}
      {Object.keys(byCategory).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: 48 }}
        >
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'rgba(192, 132, 252, 0.7)',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <Sparkles style={{ width: 16, height: 16, color: '#f472b6' }} />
              Por categoria
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Object.entries(byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, total], index) => {
                  const Icon = CATEGORIA_ICONS[cat as CategoriaGasto];
                  const colors = CATEGORIA_COLORS[cat as CategoriaGasto];
                  const percentage = totalByCategory > 0 ? (total / totalByCategory) * 100 : 0;
                  return (
                    <motion.div
                      key={cat}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            padding: 10,
                            borderRadius: 12,
                            background: colors.bg,
                            border: `1px solid ${colors.border}`
                          }}>
                            <Icon style={{ width: 16, height: 16, color: colors.text }} />
                          </div>
                          <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 14, textTransform: 'capitalize', fontWeight: 500 }}>{cat}</span>
                        </div>
                        <span style={{ color: 'white', fontWeight: 600 }}>{formatCurrency(total)}</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: 'rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
                        <motion.div
                          style={{
                            height: '100%',
                            borderRadius: 4,
                            background: 'linear-gradient(to right, #ec4899, #a855f7)'
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Gastos List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'rgba(192, 132, 252, 0.7)',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <DollarSign style={{ width: 16, height: 16, color: '#f472b6' }} />
          Historial de gastos
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AnimatePresence mode="popLayout">
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
            ) : gastos.length === 0 ? (
              <motion.div
                className="glass-card"
                style={{ padding: 40, textAlign: 'center' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <DollarSign style={{ width: 56, height: 56, margin: '0 auto', color: 'rgba(168, 85, 247, 0.3)', marginBottom: 16 }} />
                <p style={{ color: 'rgba(192, 132, 252, 0.6)', fontSize: 18 }}>No hay gastos registrados</p>
                <p style={{ color: 'rgba(168, 85, 247, 0.4)', fontSize: 14, marginTop: 8 }}>Agrega tu primer gasto con el boton de arriba</p>
              </motion.div>
            ) : (
              gastos.map((gasto, index) => {
                const Icon = CATEGORIA_ICONS[gasto.categoria];
                const colors = CATEGORIA_COLORS[gasto.categoria];
                const isEnCuotas = gasto.cuotas_total > 1;
                const isExpanded = expandedGasto === gasto.id;

                return (
                  <motion.div
                    key={gasto.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <div className="glass-card" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{
                          padding: 14,
                          borderRadius: 14,
                          background: colors.bg,
                          border: `1px solid ${colors.border}`
                        }}>
                          <Icon style={{ width: 20, height: 20, color: colors.text }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <p style={{ fontWeight: 500, color: 'white', fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {gasto.concepto}
                                </p>
                                {isEnCuotas && (
                                  <span style={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    color: gasto.progreso === 100 ? '#4ade80' : '#fbbf24',
                                    background: gasto.progreso === 100 ? 'rgba(74, 222, 128, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                                    padding: '2px 8px',
                                    borderRadius: 6,
                                    textTransform: 'uppercase'
                                  }}>
                                    {gasto.progreso === 100 ? 'Pagado' : 'En cuotas'}
                                  </span>
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                                <span style={{ fontSize: 14, color: 'rgba(192, 132, 252, 0.6)' }}>
                                  {formatDate(gasto.fecha)}
                                </span>
                                {!isEnCuotas && gasto.pagador && (
                                  <>
                                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(168, 85, 247, 0.5)' }} />
                                    <span style={{ fontSize: 14, color: 'rgba(192, 132, 252, 0.6)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <Heart style={{ width: 12, height: 12, fill: 'currentColor' }} />
                                      {gasto.pagador}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', marginLeft: 16 }}>
                              <p style={{ fontWeight: 700, color: 'white', fontSize: 20 }}>
                                {formatCurrency(gasto.monto_usd)}
                              </p>
                              {gasto.moneda === 'ARS' && (
                                <p style={{ fontSize: 12, color: 'rgba(168, 85, 247, 0.5)', marginTop: 4 }}>
                                  {formatCurrency(gasto.monto, 'ARS')} ARS
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Progress bar para gastos en cuotas */}
                          {isEnCuotas && (
                            <div style={{ marginTop: 16 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(192, 132, 252, 0.6)', marginBottom: 6 }}>
                                <span>{gasto.cuotas_pagadas}/{gasto.cuotas_total} cuotas</span>
                                <span>{gasto.progreso}%</span>
                              </div>
                              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
                                <motion.div
                                  style={{
                                    height: '100%',
                                    borderRadius: 3,
                                    background: gasto.progreso === 100
                                      ? 'linear-gradient(to right, #22c55e, #4ade80)'
                                      : 'linear-gradient(to right, #ec4899, #a855f7)'
                                  }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${gasto.progreso}%` }}
                                  transition={{ duration: 0.5 }}
                                />
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 10 }}>
                                <span style={{ color: '#f472b6', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Heart style={{ width: 12, height: 12, fill: 'currentColor' }} />
                                  Juan: {formatCurrency(gasto.pagado_juan)}
                                </span>
                                <span style={{ color: '#a855f7', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Heart style={{ width: 12, height: 12, fill: 'currentColor' }} />
                                  Vale: {formatCurrency(gasto.pagado_vale)}
                                </span>
                                <span style={{ color: 'rgba(192, 132, 252, 0.7)' }}>
                                  Restante: {formatCurrency(gasto.restante)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        {isEnCuotas && gasto.progreso < 100 && (
                          <motion.button
                            onClick={() => handleOpenPagoModal(gasto)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '8px 14px',
                              borderRadius: 10,
                              background: 'rgba(74, 222, 128, 0.2)',
                              border: '1px solid rgba(74, 222, 128, 0.3)',
                              color: '#4ade80',
                              fontSize: 13,
                              fontWeight: 500,
                              cursor: 'pointer',
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Plus style={{ width: 14, height: 14 }} />
                            Registrar cuota
                          </motion.button>
                        )}

                        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                          {isEnCuotas && (
                            <motion.button
                              onClick={() => toggleExpanded(gasto.id)}
                              style={{
                                padding: 10,
                                borderRadius: 12,
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'rgba(192, 132, 252, 0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                              whileHover={{ backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#c4b5fd' }}
                            >
                              {isExpanded ? <ChevronUp style={{ width: 16, height: 16 }} /> : <ChevronDown style={{ width: 16, height: 16 }} />}
                            </motion.button>
                          )}
                          <motion.button
                            onClick={() => handleOpenModal(gasto)}
                            style={{
                              padding: 10,
                              borderRadius: 12,
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'rgba(192, 132, 252, 0.5)'
                            }}
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#c4b5fd' }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit2 style={{ width: 16, height: 16 }} />
                          </motion.button>
                          <motion.button
                            onClick={() => confirmDelete(gasto.id)}
                            style={{
                              padding: 10,
                              borderRadius: 12,
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'rgba(192, 132, 252, 0.5)'
                            }}
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 style={{ width: 16, height: 16 }} />
                          </motion.button>
                        </div>
                      </div>

                      {/* Cuotas expandidas */}
                      <AnimatePresence>
                        {isExpanded && isEnCuotas && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              <h4 style={{ fontSize: 12, color: 'rgba(192, 132, 252, 0.6)', marginBottom: 12 }}>
                                Historial de cuotas
                              </h4>
                              {gasto.pagos.length === 0 ? (
                                <p style={{
                                  color: 'rgba(192, 132, 252, 0.5)',
                                  fontSize: 13,
                                  textAlign: 'center',
                                  padding: 16
                                }}>
                                  No hay cuotas registradas aun
                                </p>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                  {gasto.pagos.sort((a, b) => b.numero_cuota - a.numero_cuota).map((pago) => (
                                    <div
                                      key={pago.id}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '10px 14px',
                                        borderRadius: 10,
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.05)'
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span style={{ fontSize: 12, color: '#a855f7', fontWeight: 600 }}>
                                          #{pago.numero_cuota}
                                        </span>
                                        <span style={{ fontSize: 13, color: 'white' }}>
                                          {formatCurrency(pago.monto, gasto.moneda)}
                                        </span>
                                        <span style={{ fontSize: 12, color: 'rgba(192, 132, 252, 0.5)' }}>
                                          {pago.pagador}
                                        </span>
                                        <span style={{ fontSize: 12, color: 'rgba(192, 132, 252, 0.4)' }}>
                                          {formatDate(pago.fecha_pago)}
                                        </span>
                                      </div>
                                      <motion.button
                                        onClick={() => confirmDeletePago(pago.id)}
                                        style={{
                                          padding: 6,
                                          borderRadius: 8,
                                          background: 'transparent',
                                          border: 'none',
                                          cursor: 'pointer',
                                          color: 'rgba(192, 132, 252, 0.3)'
                                        }}
                                        whileHover={{ color: '#f87171' }}
                                      >
                                        <Trash2 style={{ width: 14, height: 14 }} />
                                      </motion.button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Add/Edit Gasto Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedGasto ? 'Editar gasto' : 'Nuevo gasto'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Input
            label="Concepto"
            placeholder="Ej: Hotel Miami Beach"
            value={formData.concepto}
            onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input
              label="Fecha"
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              required
            />
            <Select
              label="Categoria"
              options={CATEGORIA_OPTIONS}
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value as CategoriaGasto })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input
              label="Monto total"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.monto || ''}
              onChange={(e) => setFormData({ ...formData, monto: parseFloat(e.target.value) || 0 })}
              required
            />
            <Select
              label="Moneda"
              options={MONEDA_OPTIONS}
              value={formData.moneda}
              onChange={(e) => setFormData({ ...formData, moneda: e.target.value as Moneda })}
            />
          </div>

          {/* Tipo de pago */}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'rgba(192, 132, 252, 0.8)', marginBottom: 10 }}>
              Tipo de pago
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <motion.button
                type="button"
                onClick={() => setTipoPago('unico')}
                style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: tipoPago === 'unico' ? '2px solid #ec4899' : '2px solid rgba(168, 85, 247, 0.2)',
                  background: tipoPago === 'unico' ? 'rgba(236, 72, 153, 0.15)' : 'transparent',
                  color: tipoPago === 'unico' ? '#f9a8d4' : 'rgba(192, 132, 252, 0.6)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Pago unico
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setTipoPago('cuotas')}
                style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: tipoPago === 'cuotas' ? '2px solid #ec4899' : '2px solid rgba(168, 85, 247, 0.2)',
                  background: tipoPago === 'cuotas' ? 'rgba(236, 72, 153, 0.15)' : 'transparent',
                  color: tipoPago === 'cuotas' ? '#f9a8d4' : 'rgba(192, 132, 252, 0.6)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                En cuotas
              </motion.button>
            </div>
          </div>

          {tipoPago === 'unico' ? (
            <Select
              label="Pagador"
              options={PAGADOR_OPTIONS}
              value={formData.pagador || 'Juan'}
              onChange={(e) => setFormData({ ...formData, pagador: e.target.value as Pagador })}
            />
          ) : (
            <Input
              label="Cantidad de cuotas"
              type="number"
              min="2"
              max="48"
              value={formData.cuotas_total}
              onChange={(e) => setFormData({ ...formData, cuotas_total: parseInt(e.target.value) || 2 })}
              required
            />
          )}

          <Input
            label="Notas (opcional)"
            placeholder="Detalles adicionales..."
            value={formData.descripcion || ''}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          />

          {formData.moneda === 'ARS' && formData.monto > 0 && (
            <motion.p
              style={{
                fontSize: 14,
                color: 'rgba(192, 132, 252, 0.6)',
                textAlign: 'center',
                padding: 16,
                borderRadius: 14,
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.2)'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Equivale a ~<span style={{ color: '#f9a8d4', fontWeight: 600 }}>{formatCurrency(formData.monto / dolarRate)}</span> USD
            </motion.p>
          )}

          <div style={{ display: 'flex', gap: 16, paddingTop: 20 }}>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handleCloseModal}
              style={{ flex: 1 }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              style={{ flex: 1 }}
            >
              {selectedGasto ? 'Guardar' : 'Agregar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Registrar Cuota Modal */}
      <Modal
        isOpen={showPagoModal}
        onClose={handleClosePagoModal}
        title={`Registrar cuota - ${selectedGasto?.concepto || ''}`}
      >
        <form onSubmit={handleSubmitPago} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {selectedGasto && (
            <div style={{
              padding: 16,
              borderRadius: 12,
              background: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(168, 85, 247, 0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(192, 132, 252, 0.7)' }}>
                <span>Cuotas pagadas: {selectedGasto.cuotas_pagadas}/{selectedGasto.cuotas_total}</span>
                <span>Restante: {formatCurrency(selectedGasto.restante)}</span>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input
              label="Numero de cuota"
              type="number"
              min="1"
              max={selectedGasto?.cuotas_total || 1}
              value={pagoFormData.numero_cuota}
              onChange={(e) => setPagoFormData({ ...pagoFormData, numero_cuota: parseInt(e.target.value) || 1 })}
              required
            />
            <Input
              label="Monto"
              type="number"
              step="0.01"
              min="0"
              value={pagoFormData.monto || ''}
              onChange={(e) => setPagoFormData({ ...pagoFormData, monto: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Select
              label="Pagador"
              options={PAGADOR_OPTIONS}
              value={pagoFormData.pagador}
              onChange={(e) => setPagoFormData({ ...pagoFormData, pagador: e.target.value as Pagador })}
            />
            <Input
              label="Fecha de pago"
              type="date"
              value={pagoFormData.fecha_pago}
              onChange={(e) => setPagoFormData({ ...pagoFormData, fecha_pago: e.target.value })}
              required
            />
          </div>

          <Input
            label="Notas (opcional)"
            placeholder="Notas sobre este pago..."
            value={pagoFormData.notas || ''}
            onChange={(e) => setPagoFormData({ ...pagoFormData, notas: e.target.value })}
          />

          <div style={{ display: 'flex', gap: 16, paddingTop: 20 }}>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handleClosePagoModal}
              style={{ flex: 1 }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              style={{ flex: 1 }}
            >
              Registrar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Gasto Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar gasto"
        message="Estas seguro de que quieres eliminar este gasto? Si tiene cuotas registradas, tambien se eliminaran. Esta accion no se puede deshacer."
        confirmText="Eliminar"
      />

      {/* Delete Pago Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeletePagoModal}
        onClose={() => setShowDeletePagoModal(false)}
        onConfirm={handleDeletePago}
        title="Eliminar cuota"
        message="Estas seguro de que quieres eliminar esta cuota? Esta accion no se puede deshacer."
        confirmText="Eliminar"
      />
    </PageWrapper>
  );
}

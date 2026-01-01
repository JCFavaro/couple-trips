import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, TrendingUp, Plane, Hotel, Ticket, UtensilsCrossed, Car, ShoppingBag, MoreHorizontal, Sparkles, DollarSign, Heart } from 'lucide-react';
import { PageWrapper } from '../components/layout';
import { Button, Input, Select, Modal, ConfirmModal } from '../components/ui';
import { useGastos } from '../hooks';
import { formatCurrency, formatDate } from '../lib/utils';
import { getFormattedRate } from '../lib/dolarBlue';
import type { Gasto, GastoFormData, CategoriaGasto, Pagador, Moneda } from '../types';

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
  const { gastos, balance, dolarRate, loading, addGasto, editGasto, removeGasto } = useGastos();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGasto, setSelectedGasto] = useState<Gasto | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<GastoFormData>({
    fecha: new Date().toISOString().split('T')[0],
    concepto: '',
    categoria: 'otros',
    pagador: 'Juan',
    monto: 0,
    moneda: 'USD',
  });

  const resetForm = () => {
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      concepto: '',
      categoria: 'otros',
      pagador: 'Juan',
      monto: 0,
      moneda: 'USD',
    });
    setSelectedGasto(null);
  };

  const handleOpenModal = (gasto?: Gasto) => {
    if (gasto) {
      setSelectedGasto(gasto);
      setFormData({
        fecha: gasto.fecha,
        concepto: gasto.concepto,
        categoria: gasto.categoria,
        pagador: gasto.pagador,
        monto: gasto.monto,
        moneda: gasto.moneda,
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.concepto || formData.monto <= 0) return;

    setIsSubmitting(true);
    try {
      if (selectedGasto) {
        await editGasto(selectedGasto.id, formData);
      } else {
        await addGasto(formData);
      }
      handleCloseModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await removeGasto(deleteId);
    setDeleteId(null);
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const byCategory = gastos.reduce((acc, gasto) => {
    acc[gasto.categoria] = (acc[gasto.categoria] || 0) + gasto.monto_usd;
    return acc;
  }, {} as Record<CategoriaGasto, number>);

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
            <motion.span
              className="shimmer-text"
              style={{ fontSize: 32, fontWeight: 700 }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {formatCurrency(balance.total)}
            </motion.span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div style={{
              textAlign: 'center',
              padding: 20,
              borderRadius: 18,
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.1))',
              border: '1px solid rgba(236, 72, 153, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                <Heart style={{ width: 16, height: 16, fill: '#f472b6', color: '#f472b6' }} />
                <p style={{ color: 'rgba(192, 132, 252, 0.7)', fontSize: 14, fontWeight: 500 }}>Juan</p>
              </div>
              <p style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>{formatCurrency(balance.juan)}</p>
            </div>
            <div style={{
              textAlign: 'center',
              padding: 20,
              borderRadius: 18,
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))',
              border: '1px solid rgba(168, 85, 247, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                <Heart style={{ width: 16, height: 16, fill: '#a855f7', color: '#a855f7' }} />
                <p style={{ color: 'rgba(192, 132, 252, 0.7)', fontSize: 14, fontWeight: 500 }}>Vale</p>
              </div>
              <p style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>{formatCurrency(balance.vale)}</p>
            </div>
          </div>

          {balance.deudor && (
            <motion.div
              style={{
                padding: 20,
                borderRadius: 18,
                background: 'linear-gradient(to right, rgba(236, 72, 153, 0.2), rgba(168, 85, 247, 0.2))',
                border: '1px solid rgba(236, 72, 153, 0.3)'
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p style={{ textAlign: 'center', color: '#fbcfe8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Sparkles style={{ width: 16, height: 16, color: '#fde047' }} />
                <span>
                  <span style={{ fontWeight: 600, color: 'white' }}>{balance.deudor}</span> le debe{' '}
                  <span style={{ fontWeight: 600, color: '#f9a8d4' }}>{formatCurrency(balance.diferencia)}</span> a{' '}
                  <span style={{ fontWeight: 600, color: 'white' }}>{balance.deudor === 'Juan' ? 'Vale' : 'Juan'}</span>
                </span>
                <Sparkles style={{ width: 16, height: 16, color: '#fde047' }} />
              </p>
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
                  const percentage = (total / balance.total) * 100;
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
                              <p style={{ fontWeight: 500, color: 'white', fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {gasto.concepto}
                              </p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                                <span style={{ fontSize: 14, color: 'rgba(192, 132, 252, 0.6)' }}>
                                  {formatDate(gasto.fecha)}
                                </span>
                                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(168, 85, 247, 0.5)' }} />
                                <span style={{ fontSize: 14, color: 'rgba(192, 132, 252, 0.6)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Heart style={{ width: 12, height: 12, fill: 'currentColor' }} />
                                  {gasto.pagador}
                                </span>
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
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
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
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
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
              label="Monto"
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

          <Select
            label="Pagador"
            options={PAGADOR_OPTIONS}
            value={formData.pagador}
            onChange={(e) => setFormData({ ...formData, pagador: e.target.value as Pagador })}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar gasto"
        message="Estas seguro de que quieres eliminar este gasto? Esta accion no se puede deshacer."
        confirmText="Eliminar"
      />
    </PageWrapper>
  );
}

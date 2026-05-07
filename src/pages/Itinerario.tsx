import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, MapPin, Clock, ExternalLink, Calendar, Sparkles, Star } from 'lucide-react';
import { PageWrapper } from '../components/layout';
import { Button, Input, Modal, ConfirmModal, Textarea } from '../components/ui';
import { useItinerario, useTripConfig } from '../hooks';
import { formatDate } from '../lib/utils';
import type { Itinerario, ItinerarioFormData } from '../types';

export function ItinerarioPage() {
  const { items, groupedByDate, loading, addItem, editItem, removeItem } = useItinerario();
  const { config } = useTripConfig();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Itinerario | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ItinerarioFormData>({
    fecha: config.trip_start_date,
    titulo: '',
    descripcion: '',
    hora: '',
    ubicacion_url: '',
  });

  const resetForm = () => {
    setFormData({
      fecha: config.trip_start_date,
      titulo: '',
      descripcion: '',
      hora: '',
      ubicacion_url: '',
    });
    setSelectedItem(null);
  };

  const handleOpenModal = (item?: Itinerario) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        fecha: item.fecha,
        titulo: item.titulo,
        descripcion: item.descripcion || '',
        hora: item.hora || '',
        ubicacion_url: item.ubicacion_url || '',
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
    if (!formData.titulo || !formData.fecha) return;

    setIsSubmitting(true);
    try {
      if (selectedItem) {
        await editItem(selectedItem.id, formData);
      } else {
        await addItem(formData);
      }
      handleCloseModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await removeItem(deleteId);
    setDeleteId(null);
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  // Calculate day number from trip start
  const getDayNumber = (fecha: string): number => {
    const start = new Date(config.trip_start_date);
    const current = new Date(fecha);
    return Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <PageWrapper
      title="Itinerario"
      subtitle={`${items.length} actividades planeadas`}
      rightAction={
        <motion.button
          onClick={() => handleOpenModal()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '16px 28px',
            borderRadius: 16,
            background: 'var(--tab-active-gradient)',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: 15,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 24px var(--btn-shadow)'
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus style={{ width: 20, height: 20 }} />
          Agregar
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
            <Sparkles style={{ width: 40, height: 40, color: 'var(--loader-color)' }} />
          </motion.div>
          <p style={{ color: 'var(--theme-text-muted)', marginTop: 16 }}>Cargando...</p>
        </div>
      ) : items.length === 0 ? (
        <motion.div
          className="glass-card"
          style={{ padding: 40, textAlign: 'center' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Calendar style={{ width: 56, height: 56, margin: '0 auto', color: 'var(--theme-secondary)', opacity: 0.3, marginBottom: 16 }} />
          <p style={{ color: 'var(--theme-text-muted)', fontSize: 18 }}>No hay actividades en el itinerario</p>
          <p style={{ color: 'var(--theme-secondary)', opacity: 0.4, fontSize: 13, marginTop: 8 }}>Agrega tu primera actividad magica</p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {Array.from(groupedByDate.entries()).map(([fecha, activities], groupIndex) => {
            const dayNum = getDayNumber(fecha);
            const isToday = fecha === new Date().toISOString().split('T')[0];

            return (
              <motion.div
                key={fecha}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
              >
                {/* Day Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <motion.div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 18,
                      position: 'relative',
                      background: isToday ? 'var(--tab-active-gradient)' : 'var(--glass-bg-1)',
                      color: '#FFFFFF',
                      boxShadow: isToday ? '0 8px 20px var(--btn-shadow)' : 'none',
                      border: isToday ? 'none' : '1px solid var(--glass-border)'
                    }}
                    animate={isToday ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {dayNum}
                    {isToday && (
                      <Star style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, color: '#facc15', fill: '#facc15' }} />
                    )}
                  </motion.div>
                  <div>
                    <p style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
                      Dia {dayNum}
                      {isToday && (
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          background: 'var(--tab-active-gradient)',
                          color: '#FFFFFF',
                          border: 'none'
                        }}>
                          HOY
                        </span>
                      )}
                    </p>
                    <p style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.45)', marginTop: 4 }}>{formatDate(fecha, "EEEE, d 'de' MMMM")}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div style={{ marginLeft: 22, paddingLeft: 28, borderLeft: '3px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <AnimatePresence mode="popLayout">
                    {activities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.05 }}
                        style={{ position: 'relative' }}
                      >
                        {/* Timeline dot */}
                        <div style={{
                          position: 'absolute',
                          left: -34,
                          top: 20,
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))',
                          border: '2px solid var(--theme-bg)',
                          boxShadow: '0 4px 12px var(--btn-shadow)'
                        }} />

                        <div className="glass-card" style={{ padding: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: 600, color: '#FFFFFF', fontSize: 15 }}>
                                {activity.titulo}
                              </p>
                              {activity.descripcion && (
                                <p style={{
                                  fontSize: 13,
                                  color: 'rgba(255, 255, 255, 0.75)',
                                  marginTop: 8,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical'
                                }}>{activity.descripcion}</p>
                              )}
                              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 16 }}>
                                {activity.hora && (
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    color: 'var(--theme-text-muted)',
                                    fontSize: 11,
                                    padding: '6px 12px',
                                    borderRadius: 12,
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid var(--glass-border)'
                                  }}>
                                    <Clock style={{ width: 14, height: 14, color: 'var(--theme-accent)' }} />
                                    <span>{activity.hora}</span>
                                  </div>
                                )}
                                {activity.ubicacion_url && (
                                  <motion.a
                                    href={activity.ubicacion_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 8,
                                      color: 'var(--theme-accent)',
                                      fontSize: 11,
                                      padding: '6px 12px',
                                      borderRadius: 12,
                                      background: 'rgba(255, 255, 255, 0.04)',
                                      border: '1px solid var(--glass-border)',
                                      textDecoration: 'none'
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <MapPin style={{ width: 14, height: 14 }} />
                                    <span>Ver mapa</span>
                                    <ExternalLink style={{ width: 12, height: 12 }} />
                                  </motion.a>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <motion.button
                                onClick={() => handleOpenModal(activity)}
                                style={{
                                  width: 44,
                                  height: 44,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: 0,
                                  borderRadius: 12,
                                  background: 'var(--glass-bg-1)',
                                  border: '1px solid var(--glass-border)',
                                  color: 'var(--theme-text-muted)',
                                  cursor: 'pointer'
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Edit2 style={{ width: 16, height: 16 }} />
                              </motion.button>
                              <motion.button
                                onClick={() => confirmDelete(activity.id)}
                                style={{
                                  width: 44,
                                  height: 44,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: 0,
                                  borderRadius: 12,
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  border: '1px solid rgba(239, 68, 68, 0.2)',
                                  color: 'rgba(248, 113, 113, 0.6)',
                                  cursor: 'pointer'
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Trash2 style={{ width: 16, height: 16 }} />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedItem ? 'Editar actividad' : 'Nueva actividad'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Titulo"
            placeholder="Ej: Magic Kingdom"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            required
          />

          <Textarea
            label="Descripcion (opcional)"
            placeholder="Detalles adicionales..."
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fecha"
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              required
            />
            <Input
              label="Hora (opcional)"
              type="time"
              value={formData.hora}
              onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
            />
          </div>

          <Input
            label="Link a Google Maps (opcional)"
            placeholder="https://maps.google.com/..."
            value={formData.ubicacion_url}
            onChange={(e) => setFormData({ ...formData, ubicacion_url: e.target.value })}
          />

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
              {selectedItem ? 'Guardar' : 'Agregar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar actividad"
        message="Estas seguro de que quieres eliminar esta actividad?"
        confirmText="Eliminar"
      />
    </PageWrapper>
  );
}

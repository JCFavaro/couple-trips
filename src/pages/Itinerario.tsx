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
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium text-sm shadow-lg shadow-pink-500/30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
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
            <Sparkles style={{ width: 40, height: 40, color: '#f472b6' }} />
          </motion.div>
          <p style={{ color: 'rgba(192, 132, 252, 0.5)', marginTop: 16 }}>Cargando...</p>
        </div>
      ) : items.length === 0 ? (
        <motion.div
          className="glass-card"
          style={{ padding: 40, textAlign: 'center' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Calendar style={{ width: 56, height: 56, margin: '0 auto', color: 'rgba(168, 85, 247, 0.3)', marginBottom: 16 }} />
          <p style={{ color: 'rgba(192, 132, 252, 0.6)', fontSize: 18 }}>No hay actividades en el itinerario</p>
          <p style={{ color: 'rgba(168, 85, 247, 0.4)', fontSize: 14, marginTop: 8 }}>Agrega tu primera actividad magica</p>
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
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl relative ${
                      isToday
                        ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/40'
                        : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                    }`}
                    animate={isToday ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {dayNum}
                    {isToday && (
                      <Star className="absolute -top-1.5 -right-1.5 w-5 h-5 text-yellow-400 fill-yellow-400" />
                    )}
                  </motion.div>
                  <div>
                    <p className="font-semibold text-white text-lg flex items-center gap-3">
                      Dia {dayNum}
                      {isToday && (
                        <span className="px-3 py-1 rounded-full text-xs bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-pink-300 border border-pink-500/30">
                          Hoy
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-purple-300/60 mt-1">{formatDate(fecha, "EEEE, d 'de' MMMM")}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="ml-7 pl-7 border-l-2 space-y-4" style={{ borderImage: 'linear-gradient(to bottom, rgba(236, 72, 153, 0.5), rgba(168, 85, 247, 0.5)) 1' }}>
                  <AnimatePresence mode="popLayout">
                    {activities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative"
                      >
                        {/* Timeline dot */}
                        <div className="absolute -left-[31px] top-5 w-4 h-4 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 border-2 border-[#1a0a2e] shadow-lg shadow-pink-500/30" />

                        <div className="glass-card p-5 group hover:border-pink-500/40 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-semibold text-white text-base group-hover:text-pink-200 transition-colors">
                                {activity.titulo}
                              </p>
                              {activity.descripcion && (
                                <p className="text-sm text-purple-300/60 mt-2 line-clamp-2">{activity.descripcion}</p>
                              )}
                              <div className="flex flex-wrap items-center gap-3 mt-4">
                                {activity.hora && (
                                  <div className="flex items-center gap-2 text-purple-300/70 text-sm px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                    <Clock className="w-4 h-4 text-pink-400" />
                                    <span>{activity.hora}</span>
                                  </div>
                                )}
                                {activity.ubicacion_url && (
                                  <motion.a
                                    href={activity.ubicacion_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-pink-300 text-sm px-3 py-1.5 rounded-xl bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <MapPin className="w-4 h-4" />
                                    <span>Ver mapa</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </motion.a>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <motion.button
                                onClick={() => handleOpenModal(activity)}
                                className="p-2.5 rounded-xl hover:bg-purple-500/20 text-purple-300/50 hover:text-purple-300 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                onClick={() => confirmDelete(activity.id)}
                                className="p-2.5 rounded-xl hover:bg-red-500/20 text-purple-300/50 hover:text-red-400 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Trash2 className="w-4 h-4" />
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

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="flex-1"
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

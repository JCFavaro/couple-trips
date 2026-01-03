import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Edit2, MapPin, Check, ExternalLink,
  StickyNote, Luggage, ShoppingCart, ChevronRight,
  Settings, DollarSign, Calendar, UtensilsCrossed, Store, Sparkles, Lightbulb, LogOut, User, Heart,
  FileText, Download, Eye, Upload, File, FolderOpen, Plane, Ticket, Shield, CalendarCheck, ArrowLeftRight
} from 'lucide-react';
import { PageWrapper } from '../components/layout';
import { Button, Input, Select, Modal, ConfirmModal, Textarea } from '../components/ui';
import { useLugares, useNotas, useTripConfig, useAuth, useDocumentos } from '../hooks';
import { useTrip } from '../contexts';
import { setManualDolarRate, getFormattedRate } from '../lib/dolarBlue';
import { formatDate, isImageFile, isPdfFile, getFileExtension } from '../lib/utils';
import type { Lugar, LugarFormData, TipoLugar, Nota, NotaFormData, TipoNota, Documento, CategoriaDocumento } from '../types';

const TIPO_LUGAR_ICONS: Record<TipoLugar, typeof MapPin> = {
  restaurante: UtensilsCrossed,
  tienda: Store,
  atraccion: Sparkles,
  tip: Lightbulb,
};

const TIPO_LUGAR_COLORS: Record<TipoLugar, string> = {
  restaurante: 'from-orange-500/30 to-amber-500/30 text-orange-300 border-orange-500/30',
  tienda: 'from-purple-500/30 to-violet-500/30 text-purple-300 border-purple-500/30',
  atraccion: 'from-pink-500/30 to-rose-500/30 text-pink-300 border-pink-500/30',
  tip: 'from-yellow-500/30 to-amber-500/30 text-yellow-300 border-yellow-500/30',
};

const TIPO_LUGAR_OPTIONS = [
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'tienda', label: 'Tienda' },
  { value: 'atraccion', label: 'Atraccion' },
  { value: 'tip', label: 'Tip' },
];

const TIPO_NOTA_ICONS: Record<TipoNota, typeof StickyNote> = {
  general: StickyNote,
  llevar: Luggage,
  comprar: ShoppingCart,
};

const TIPO_NOTA_COLORS: Record<TipoNota, string> = {
  general: 'from-blue-500/30 to-cyan-500/30 text-blue-300 border-blue-500/30',
  llevar: 'from-green-500/30 to-emerald-500/30 text-green-300 border-green-500/30',
  comprar: 'from-pink-500/30 to-rose-500/30 text-pink-300 border-pink-500/30',
};

const TIPO_NOTA_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'llevar', label: 'Que llevar' },
  { value: 'comprar', label: 'Que comprar' },
];

type TabType = 'lugares' | 'notas' | 'documentos' | 'config';

export function Config() {
  const [activeTab, setActiveTab] = useState<TabType>('lugares');

  return (
    <PageWrapper title="Configuracion">
      {/* Tabs - 2x2 grid for better touch targets */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        marginBottom: 28
      }}>
        {[
          { id: 'lugares' as const, label: 'Lugares', icon: MapPin },
          { id: 'notas' as const, label: 'Notas', icon: StickyNote },
          { id: 'documentos' as const, label: 'Docs', icon: FileText },
          { id: 'config' as const, label: 'Config', icon: Settings },
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '14px 16px',
              borderRadius: 16,
              fontSize: 15,
              fontWeight: 600,
              position: 'relative',
              overflow: 'hidden',
              background: activeTab === tab.id
                ? 'var(--tab-active-gradient)'
                : 'var(--glass-bg-1)',
              color: activeTab === tab.id ? 'white' : 'var(--theme-text-muted)',
              border: activeTab === tab.id ? 'none' : '1px solid var(--glass-border)',
              boxShadow: activeTab === tab.id ? '0 4px 16px var(--btn-shadow)' : 'none',
            }}
            whileTap={{ scale: 0.97 }}
          >
            <tab.icon style={{ width: 20, height: 20 }} />
            {tab.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'lugares' && <LugaresTab key="lugares" />}
        {activeTab === 'notas' && <NotasTab key="notas" />}
        {activeTab === 'documentos' && <DocumentosTab key="documentos" />}
        {activeTab === 'config' && <ConfigTab key="config" />}
      </AnimatePresence>
    </PageWrapper>
  );
}

// ============ LUGARES TAB ============
function LugaresTab() {
  const { lugares, visitados, pendientes, loading, addLugar, editLugar, toggleVisitado, removeLugar } = useLugares();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLugar, setSelectedLugar] = useState<Lugar | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<LugarFormData>({
    nombre: '',
    tipo: 'atraccion',
    maps_url: '',
    notas: '',
  });

  const resetForm = () => {
    setFormData({ nombre: '', tipo: 'atraccion', maps_url: '', notas: '' });
    setSelectedLugar(null);
  };

  const handleOpenModal = (lugar?: Lugar) => {
    if (lugar) {
      setSelectedLugar(lugar);
      setFormData({
        nombre: lugar.nombre,
        tipo: lugar.tipo,
        maps_url: lugar.maps_url || '',
        notas: lugar.notas || '',
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
    if (!formData.nombre) return;

    setIsSubmitting(true);
    try {
      if (selectedLugar) {
        await editLugar(selectedLugar.id, formData);
      } else {
        await addLugar(formData);
      }
      handleCloseModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await removeLugar(deleteId);
    setDeleteId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
          <motion.p
            className="text-4xl font-bold shimmer-text"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {pendientes}
          </motion.p>
          <p style={{ fontSize: 14, color: 'var(--theme-text-muted)', marginTop: 4 }}>Por visitar</p>
        </div>
        <div className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 36, fontWeight: 700, color: 'var(--success-color)' }}>{visitados}</p>
          <p style={{ fontSize: 14, color: 'var(--theme-text-muted)', marginTop: 4 }}>Visitados</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <motion.button
          onClick={() => handleOpenModal()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '16px 28px',
            borderRadius: 16,
            background: 'var(--tab-active-gradient)',
            color: 'white',
            fontWeight: 600,
            fontSize: 16,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 24px var(--btn-shadow)'
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus style={{ width: 20, height: 20 }} />
          Agregar lugar
        </motion.button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block"
          >
            <Sparkles style={{ width: 32, height: 32, color: 'var(--loader-color)' }} />
          </motion.div>
          <p style={{ color: 'var(--theme-text-muted)', marginTop: 12 }}>Cargando...</p>
        </div>
      ) : lugares.length === 0 ? (
        <motion.div
          className="glass-card p-10 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <MapPin style={{ width: 56, height: 56, margin: '0 auto', color: 'var(--theme-accent)', opacity: 0.3, marginBottom: 16 }} />
          <p style={{ color: 'var(--theme-text-muted)', fontSize: 18 }}>No hay lugares guardados</p>
          <p style={{ color: 'var(--theme-text-muted)', opacity: 0.6, fontSize: 14, marginTop: 8 }}>Agrega lugares para visitar</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {lugares.map((lugar, index) => {
              const Icon = TIPO_LUGAR_ICONS[lugar.tipo];
              return (
                <motion.div
                  key={lugar.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <div
                    className={`glass-card group hover:border-pink-500/40 transition-colors ${lugar.visitado ? 'opacity-60' : ''}`}
                    style={{ padding: 20 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <motion.button
                        onClick={() => toggleVisitado(lugar.id)}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          border: lugar.visitado ? 'none' : '2px solid rgba(168, 85, 247, 0.4)',
                          background: lugar.visitado
                            ? 'linear-gradient(135deg, #22c55e, #10b981)'
                            : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: lugar.visitado ? '0 4px 12px rgba(34, 197, 94, 0.3)' : 'none',
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {lugar.visitado && <Check style={{ width: 18, height: 18, color: 'white' }} />}
                      </motion.button>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                          <div
                            className={`bg-gradient-to-br ${TIPO_LUGAR_COLORS[lugar.tipo]} border`}
                            style={{ padding: 8, borderRadius: 10 }}
                          >
                            <Icon style={{ width: 18, height: 18 }} />
                          </div>
                          <p
                            style={{
                              fontWeight: 500,
                              fontSize: 16,
                              color: lugar.visitado ? 'rgba(192, 132, 252, 0.6)' : 'white',
                              textDecoration: lugar.visitado ? 'line-through' : 'none',
                            }}
                          >
                            {lugar.nombre}
                          </p>
                        </div>
                        {lugar.notas && (
                          <p style={{ fontSize: 14, color: 'rgba(192, 132, 252, 0.5)', marginTop: 8 }} className="line-clamp-1">{lugar.notas}</p>
                        )}
                        {lugar.maps_url && (
                          <motion.a
                            href={lugar.maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 8,
                              color: '#f9a8d4',
                              fontSize: 14,
                              marginTop: 12,
                              padding: '8px 14px',
                              borderRadius: 10,
                              background: 'rgba(236, 72, 153, 0.1)',
                              border: '1px solid rgba(236, 72, 153, 0.2)',
                            }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <MapPin style={{ width: 16, height: 16 }} />
                            Ver en mapa
                            <ExternalLink style={{ width: 14, height: 14 }} />
                          </motion.a>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <motion.button
                          onClick={() => handleOpenModal(lugar)}
                          style={{
                            padding: 10,
                            borderRadius: 12,
                            background: 'transparent',
                            border: 'none',
                            color: 'rgba(192, 132, 252, 0.5)',
                            cursor: 'pointer',
                          }}
                          whileHover={{ scale: 1.1, backgroundColor: 'rgba(168, 85, 247, 0.2)' }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Edit2 style={{ width: 20, height: 20 }} />
                        </motion.button>
                        <motion.button
                          onClick={() => { setDeleteId(lugar.id); setShowDeleteModal(true); }}
                          style={{
                            padding: 10,
                            borderRadius: 12,
                            background: 'transparent',
                            border: 'none',
                            color: 'rgba(192, 132, 252, 0.5)',
                            cursor: 'pointer',
                          }}
                          whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 style={{ width: 20, height: 20 }} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={handleCloseModal} title={selectedLugar ? 'Editar lugar' : 'Nuevo lugar'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            placeholder="Ej: Restaurante Be Our Guest"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
          <Select
            label="Tipo"
            options={TIPO_LUGAR_OPTIONS}
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoLugar })}
          />
          <Input
            label="Link a Google Maps (opcional)"
            placeholder="https://maps.google.com/..."
            value={formData.maps_url}
            onChange={(e) => setFormData({ ...formData, maps_url: e.target.value })}
          />
          <Textarea
            label="Notas (opcional)"
            placeholder="Detalles adicionales..."
            value={formData.notas}
            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
          />
          <div style={{ display: 'flex', gap: 16, paddingTop: 20 }}>
            <Button type="button" variant="secondary" size="lg" onClick={handleCloseModal} style={{ flex: 1 }}>
              Cancelar
            </Button>
            <Button type="submit" size="lg" isLoading={isSubmitting} style={{ flex: 1 }}>
              {selectedLugar ? 'Guardar' : 'Agregar'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar lugar"
        message="Estas seguro de que quieres eliminar este lugar?"
        confirmText="Eliminar"
      />
    </motion.div>
  );
}

// ============ NOTAS TAB ============
function NotasTab() {
  const { notas, loading, addNota, editNota, removeNota } = useNotas();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNota, setSelectedNota] = useState<Nota | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<NotaFormData>({
    titulo: '',
    contenido: '',
    tipo: 'general',
  });

  const resetForm = () => {
    setFormData({ titulo: '', contenido: '', tipo: 'general' });
    setSelectedNota(null);
  };

  const handleOpenModal = (nota?: Nota) => {
    if (nota) {
      setSelectedNota(nota);
      setFormData({
        titulo: nota.titulo,
        contenido: nota.contenido || '',
        tipo: nota.tipo,
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
    if (!formData.titulo) return;

    setIsSubmitting(true);
    try {
      if (selectedNota) {
        await editNota(selectedNota.id, formData);
      } else {
        await addNota(formData);
      }
      handleCloseModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await removeNota(deleteId);
    setDeleteId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <motion.button
          onClick={() => handleOpenModal()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '16px 28px',
            borderRadius: 16,
            background: 'var(--tab-active-gradient)',
            color: 'white',
            fontWeight: 600,
            fontSize: 16,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 24px var(--btn-shadow)'
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus style={{ width: 20, height: 20 }} />
          Nueva nota
        </motion.button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block"
          >
            <Sparkles style={{ width: 32, height: 32, color: 'var(--loader-color)' }} />
          </motion.div>
          <p style={{ color: 'var(--theme-text-muted)', marginTop: 12 }}>Cargando...</p>
        </div>
      ) : notas.length === 0 ? (
        <motion.div
          className="glass-card p-10 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <StickyNote style={{ width: 56, height: 56, margin: '0 auto', color: 'var(--theme-accent)', opacity: 0.3, marginBottom: 16 }} />
          <p style={{ color: 'var(--theme-text-muted)', fontSize: 18 }}>No hay notas guardadas</p>
          <p style={{ color: 'var(--theme-text-muted)', opacity: 0.6, fontSize: 14, marginTop: 8 }}>Crea notas para recordar cosas importantes</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {notas.map((nota, index) => {
              const Icon = TIPO_NOTA_ICONS[nota.tipo];
              return (
                <motion.div
                  key={nota.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <motion.div
                    className="glass-card p-5 group cursor-pointer hover:border-pink-500/40 transition-colors"
                    onClick={() => handleOpenModal(nota)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${TIPO_NOTA_COLORS[nota.tipo]} border`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white group-hover:text-pink-200 transition-colors text-lg">{nota.titulo}</p>
                        {nota.contenido && (
                          <p className="text-sm text-purple-300/50 mt-2 line-clamp-2">{nota.contenido}</p>
                        )}
                      </div>
                      <ChevronRight className="w-6 h-6 text-purple-400/30 group-hover:text-pink-400 transition-colors" />
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={handleCloseModal} title={selectedNota ? 'Editar nota' : 'Nueva nota'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Titulo"
            placeholder="Ej: Lista de cosas para llevar"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            required
          />
          <Select
            label="Tipo"
            options={TIPO_NOTA_OPTIONS}
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoNota })}
          />
          <Textarea
            label="Contenido"
            placeholder="Escribe tu nota aqui..."
            value={formData.contenido}
            onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
            className="min-h-[200px]"
          />
          <div style={{ display: 'flex', gap: 16, paddingTop: 20 }}>
            <Button type="button" variant="secondary" size="lg" onClick={handleCloseModal} style={{ flex: 1 }}>
              Cancelar
            </Button>
            {selectedNota && (
              <Button
                type="button"
                variant="danger"
                size="lg"
                onClick={() => { setDeleteId(selectedNota.id); setShowDeleteModal(true); handleCloseModal(); }}
              >
                Eliminar
              </Button>
            )}
            <Button type="submit" size="lg" isLoading={isSubmitting} style={{ flex: 1 }}>
              {selectedNota ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar nota"
        message="Estas seguro de que quieres eliminar esta nota?"
        confirmText="Eliminar"
      />
    </motion.div>
  );
}

// ============ DOCUMENTOS TAB ============
const CATEGORIA_DOC_ICONS: Record<CategoriaDocumento, typeof FileText> = {
  reservas: CalendarCheck,
  tickets: Ticket,
  vuelos: Plane,
  seguro: Shield,
  otros: FileText,
};

const CATEGORIA_DOC_COLORS: Record<CategoriaDocumento, string> = {
  reservas: 'from-purple-500/30 to-violet-500/30 text-purple-300 border-purple-500/30',
  tickets: 'from-pink-500/30 to-rose-500/30 text-pink-300 border-pink-500/30',
  vuelos: 'from-blue-500/30 to-cyan-500/30 text-blue-300 border-blue-500/30',
  seguro: 'from-green-500/30 to-emerald-500/30 text-green-300 border-green-500/30',
  otros: 'from-gray-500/30 to-slate-500/30 text-gray-300 border-gray-500/30',
};

const CATEGORIA_DOC_OPTIONS = [
  { value: 'reservas', label: 'Reservas' },
  { value: 'tickets', label: 'Tickets' },
  { value: 'vuelos', label: 'Vuelos' },
  { value: 'seguro', label: 'Seguro' },
  { value: 'otros', label: 'Otros' },
];

function DocumentosTab() {
  const { documentos, loading, uploading, upload, remove } = useDocumentos();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Documento | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<Documento | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState<CategoriaDocumento>('otros');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const resetForm = () => {
    setNombre('');
    setCategoria('otros');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!nombre) {
        setNombre(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !nombre) return;

    const success = await upload(selectedFile, nombre, categoria);
    if (success) {
      handleCloseModal();
    }
  };

  const handleDelete = async () => {
    if (!deleteDoc) return;
    await remove(deleteDoc.id, deleteDoc.archivo_url);
    setDeleteDoc(null);
  };

  const confirmDelete = (doc: Documento) => {
    setDeleteDoc(doc);
    setShowDeleteModal(true);
  };

  const openPreview = (doc: Documento) => {
    setSelectedDoc(doc);
    setShowPreviewModal(true);
  };

  const downloadFile = (doc: Documento) => {
    window.open(doc.archivo_url, '_blank');
  };

  const groupedDocs = documentos.reduce((acc, doc) => {
    const cat = doc.categoria as CategoriaDocumento;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(doc);
    return acc;
  }, {} as Record<CategoriaDocumento, Documento[]>);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <p style={{ fontSize: 14, color: 'var(--theme-text-muted)' }}>{documentos.length} archivos</p>
        <motion.button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '16px 28px',
            borderRadius: 16,
            background: 'var(--tab-active-gradient)',
            color: 'white',
            fontWeight: 600,
            fontSize: 16,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 24px var(--btn-shadow)'
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus style={{ width: 20, height: 20 }} />
          Subir
        </motion.button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block"
          >
            <Sparkles style={{ width: 32, height: 32, color: 'var(--loader-color)' }} />
          </motion.div>
          <p style={{ color: 'var(--theme-text-muted)', marginTop: 12 }}>Cargando...</p>
        </div>
      ) : documentos.length === 0 ? (
        <motion.div
          className="glass-card p-10 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <FolderOpen style={{ width: 56, height: 56, margin: '0 auto', color: 'var(--theme-accent)', opacity: 0.3, marginBottom: 16 }} />
          <p style={{ color: 'var(--theme-text-muted)', fontSize: 18 }}>No hay documentos</p>
          <p style={{ color: 'var(--theme-text-muted)', opacity: 0.6, fontSize: 14, marginTop: 8 }}>Sube reservas, tickets y mas</p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {Object.entries(groupedDocs).map(([cat, docs], groupIndex) => {
            const Icon = CATEGORIA_DOC_ICONS[cat as CategoriaDocumento];
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${CATEGORIA_DOC_COLORS[cat as CategoriaDocumento]} border`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-white text-lg capitalize">{cat}</h3>
                  <span className="text-purple-400/50 text-sm">({docs.length})</span>
                </div>

                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {docs.map((doc, index) => {
                      const isImage = isImageFile(doc.archivo_nombre || '');
                      const isPdf = isPdfFile(doc.archivo_nombre || '');
                      const ext = getFileExtension(doc.archivo_nombre || '').toUpperCase();

                      return (
                        <motion.div
                          key={doc.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          <div className="glass-card p-5 group hover:border-pink-500/40 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {isImage ? (
                                  <img
                                    src={doc.archivo_url}
                                    alt={doc.nombre}
                                    className="w-full h-full object-cover rounded-xl"
                                  />
                                ) : (
                                  <span className="text-sm font-bold text-purple-300/60">{ext}</span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-white text-base truncate group-hover:text-pink-200 transition-colors">
                                  {doc.nombre}
                                </p>
                                <p className="text-sm text-purple-300/50 mt-1">
                                  {formatDate(doc.created_at)}
                                </p>
                              </div>

                              <div className="flex gap-2">
                                {(isImage || isPdf) && (
                                  <motion.button
                                    onClick={() => openPreview(doc)}
                                    className="p-2.5 rounded-xl hover:bg-purple-500/20 text-purple-300/50 hover:text-purple-300 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </motion.button>
                                )}
                                <motion.button
                                  onClick={() => downloadFile(doc)}
                                  className="p-2.5 rounded-xl hover:bg-pink-500/20 text-purple-300/50 hover:text-pink-300 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Download className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                  onClick={() => confirmDelete(doc)}
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
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={showModal} onClose={handleCloseModal} title="Subir documento">
        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-purple-500/30 rounded-2xl p-8 text-center cursor-pointer hover:border-pink-500/50 hover:bg-pink-500/5 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx"
            />
            {selectedFile ? (
              <div>
                <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center mb-4">
                  <File className="w-7 h-7 text-pink-300" />
                </div>
                <p className="text-white font-medium text-lg">{selectedFile.name}</p>
                <p className="text-purple-300/50 text-sm mt-2">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                  <Upload className="w-7 h-7 text-purple-300/70" />
                </div>
                <p className="text-purple-200/70 text-lg">Toca para seleccionar</p>
                <p className="text-purple-400/40 text-sm mt-2">PDF, imagenes o documentos</p>
              </div>
            )}
          </motion.div>

          <Input
            label="Nombre"
            placeholder="Ej: Reserva Hotel Miami"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <Select
            label="Categoria"
            options={CATEGORIA_DOC_OPTIONS}
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as CategoriaDocumento)}
          />

          <div style={{ display: 'flex', gap: 16, paddingTop: 20 }}>
            <Button type="button" variant="secondary" size="lg" onClick={handleCloseModal} style={{ flex: 1 }}>
              Cancelar
            </Button>
            <Button type="submit" size="lg" isLoading={uploading} disabled={!selectedFile || !nombre} style={{ flex: 1 }}>
              Subir
            </Button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)} title={selectedDoc?.nombre} size="lg">
        {selectedDoc && (
          <div className="max-h-[70vh] overflow-auto rounded-xl">
            {isImageFile(selectedDoc.archivo_nombre || '') ? (
              <img src={selectedDoc.archivo_url} alt={selectedDoc.nombre} className="w-full rounded-xl" />
            ) : isPdfFile(selectedDoc.archivo_nombre || '') ? (
              <iframe src={selectedDoc.archivo_url} className="w-full h-[60vh] rounded-xl bg-white" title={selectedDoc.nombre} />
            ) : null}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar documento"
        message={`Estas seguro de que quieres eliminar "${deleteDoc?.nombre}"?`}
        confirmText="Eliminar"
      />
    </motion.div>
  );
}

// ============ CONFIG TAB ============
function ConfigTab() {
  const navigate = useNavigate();
  const { currentTrip, clearTrip } = useTrip();
  const { config, update } = useTripConfig();
  const [manualRate, setManualRate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveRate = async () => {
    const rate = parseFloat(manualRate);
    if (isNaN(rate) || rate <= 0) return;

    setIsSaving(true);
    try {
      setManualDolarRate(rate);
      await update({ dolar_blue_rate: rate });
      setManualRate('');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeTrip = () => {
    clearTrip();
    navigate('/trips');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      {/* Change Trip Button */}
      <motion.button
        onClick={handleChangeTrip}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: 20,
          borderRadius: 20,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          cursor: 'pointer',
        }}
        whileHover={{ scale: 1.02, borderColor: 'rgba(168, 85, 247, 0.5)' }}
        whileTap={{ scale: 0.98 }}
      >
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${currentTrip?.color_primary || '#ec4899'}20, ${currentTrip?.color_secondary || '#8b5cf6'}20)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
        }}>
          {currentTrip?.emoji || '✈️'}
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <p style={{ fontWeight: 600, color: 'white', fontSize: 17, marginBottom: 4 }}>
            {currentTrip?.nombre || 'Viaje'}
          </p>
          <p style={{ fontSize: 14, color: 'rgba(192, 132, 252, 0.6)' }}>
            {currentTrip?.destino || 'Destino'}
          </p>
        </div>
        <div style={{
          padding: 12,
          borderRadius: 12,
          background: 'rgba(168, 85, 247, 0.2)',
        }}>
          <ArrowLeftRight style={{ width: 20, height: 20, color: '#c4b5fd' }} />
        </div>
      </motion.button>

      {/* Trip dates */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            padding: 14,
            borderRadius: 16,
            background: 'var(--glass-bg-1)',
            border: '1px solid var(--glass-border)'
          }}>
            <Calendar style={{ width: 28, height: 28, color: 'var(--theme-accent)' }} />
          </div>
          <div>
            <p style={{ fontWeight: 600, color: 'white', fontSize: 18, marginBottom: 6 }}>Fechas del viaje</p>
            <p style={{ fontSize: 15, color: 'var(--theme-text-muted)' }}>
              {formatDate(config.trip_start_date, "d 'de' MMMM")} - {formatDate(config.trip_end_date, "d 'de' MMMM, yyyy")}
            </p>
          </div>
        </div>
      </div>

      {/* Dolar rate */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            padding: 14,
            borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.3))',
            border: '1px solid rgba(34, 197, 94, 0.3)'
          }}>
            <DollarSign style={{ width: 28, height: 28, color: 'var(--success-color)' }} />
          </div>
          <div>
            <p style={{ fontWeight: 600, color: 'white', fontSize: 18, marginBottom: 6 }}>Dolar Blue</p>
            <p style={{ fontSize: 15, color: 'var(--theme-text-muted)' }}>{getFormattedRate()}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Input
            placeholder="Nuevo valor..."
            type="number"
            value={manualRate}
            onChange={(e) => setManualRate(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSaveRate} isLoading={isSaving} disabled={!manualRate}>
            Guardar
          </Button>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(168, 85, 247, 0.5)', marginTop: 16 }}>
          La tasa se actualiza automaticamente desde la API, pero puedes establecer una manualmente.
        </p>
      </div>

      {/* User & Logout */}
      <UserSection />
    </motion.div>
  );
}

// ============ USER SECTION ============
function UserSection() {
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* User info */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            padding: 14,
            borderRadius: 16,
            background: 'var(--glass-bg-1)',
            border: '1px solid var(--glass-border)'
          }}>
            <User style={{ width: 28, height: 28, color: 'var(--theme-accent)' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 600, color: 'white', fontSize: 18, marginBottom: 6 }}>Sesion activa</p>
            <p style={{ fontSize: 15, color: 'var(--theme-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Logout button */}
      <motion.button
        onClick={handleLogout}
        disabled={isLoggingOut}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: '18px 24px',
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(236, 72, 153, 0.15))',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: 'var(--theme-accent)',
          fontWeight: 600,
          fontSize: 16,
          cursor: isLoggingOut ? 'not-allowed' : 'pointer',
          opacity: isLoggingOut ? 0.5 : 1,
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isLoggingOut ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles style={{ width: 22, height: 22, color: 'var(--loader-color)' }} />
          </motion.div>
        ) : (
          <>
            <LogOut style={{ width: 22, height: 22 }} />
            Cerrar sesion
          </>
        )}
      </motion.button>

      {/* App info */}
      <div style={{ textAlign: 'center', paddingTop: 24 }}>
        <p style={{ fontSize: 14, color: 'var(--theme-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <Heart style={{ width: 16, height: 16, fill: 'var(--heart-color)', color: 'var(--heart-color)', opacity: 0.5 }} />
          Trips J&V - Juan & Vale
          <Heart style={{ width: 16, height: 16, fill: 'var(--heart-color)', color: 'var(--heart-color)', opacity: 0.5 }} />
        </p>
      </div>
    </div>
  );
}

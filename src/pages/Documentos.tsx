import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Download, FileText, Plane, Ticket, Shield, CalendarCheck, Eye, Upload, File, Sparkles, FolderOpen } from 'lucide-react';
import { PageWrapper } from '../components/layout';
import { Button, Input, Select, Modal, ConfirmModal } from '../components/ui';
import { useDocumentos } from '../hooks';
import { formatDate, isImageFile, isPdfFile, getFileExtension } from '../lib/utils';
import type { Documento, CategoriaDocumento } from '../types';

const CATEGORIA_ICONS: Record<CategoriaDocumento, typeof FileText> = {
  reservas: CalendarCheck,
  tickets: Ticket,
  vuelos: Plane,
  seguro: Shield,
  otros: FileText,
};

const CATEGORIA_COLORS: Record<CategoriaDocumento, string> = {
  reservas: 'from-purple-500/30 to-violet-500/30 text-purple-300 border-purple-500/30',
  tickets: 'from-pink-500/30 to-rose-500/30 text-pink-300 border-pink-500/30',
  vuelos: 'from-blue-500/30 to-cyan-500/30 text-blue-300 border-blue-500/30',
  seguro: 'from-green-500/30 to-emerald-500/30 text-green-300 border-green-500/30',
  otros: 'from-gray-500/30 to-slate-500/30 text-gray-300 border-gray-500/30',
};

const CATEGORIA_OPTIONS = [
  { value: 'reservas', label: 'Reservas' },
  { value: 'tickets', label: 'Tickets' },
  { value: 'vuelos', label: 'Vuelos' },
  { value: 'seguro', label: 'Seguro' },
  { value: 'otros', label: 'Otros' },
];

export function Documentos() {
  const { documentos, loading, uploading, upload, remove } = useDocumentos();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Documento | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<Documento | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
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
        setNombre(file.name.replace(/\.[^/.]+$/, '')); // Remove extension
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

  // Group by category
  const groupedDocs = documentos.reduce((acc, doc) => {
    const cat = doc.categoria as CategoriaDocumento;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(doc);
    return acc;
  }, {} as Record<CategoriaDocumento, Documento[]>);

  return (
    <PageWrapper
      title="Documentos"
      subtitle={`${documentos.length} archivos guardados`}
      rightAction={
        <motion.button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium text-sm shadow-lg shadow-pink-500/30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
          Subir
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
      ) : documentos.length === 0 ? (
        <motion.div
          className="glass-card"
          style={{ padding: 40, textAlign: 'center' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <FolderOpen style={{ width: 56, height: 56, margin: '0 auto', color: 'rgba(168, 85, 247, 0.3)', marginBottom: 16 }} />
          <p style={{ color: 'rgba(192, 132, 252, 0.6)', fontSize: 18 }}>No hay documentos guardados</p>
          <p style={{ color: 'rgba(168, 85, 247, 0.4)', fontSize: 14, marginTop: 8 }}>Sube reservas, tickets y mas</p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {Object.entries(groupedDocs).map(([cat, docs], groupIndex) => {
            const Icon = CATEGORIA_ICONS[cat as CategoriaDocumento];
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${CATEGORIA_COLORS[cat as CategoriaDocumento]} border`}>
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
                              {/* Thumbnail or icon */}
                              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
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

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-white text-base truncate group-hover:text-pink-200 transition-colors">
                                  {doc.nombre}
                                </p>
                                <p className="text-sm text-purple-300/50 mt-2">
                                  {formatDate(doc.created_at)}
                                  {doc.uploaded_by && (
                                    <span className="ml-3 px-2.5 py-1 rounded-lg text-xs bg-purple-500/10 border border-purple-500/20 text-purple-300/60">
                                      {doc.uploaded_by}
                                    </span>
                                  )}
                                </p>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2">
                                {(isImage || isPdf) && (
                                  <motion.button
                                    onClick={() => openPreview(doc)}
                                    className="p-2.5 rounded-xl hover:bg-purple-500/20 text-purple-300/50 hover:text-purple-300 transition-colors"
                                    title="Ver"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </motion.button>
                                )}
                                <motion.button
                                  onClick={() => downloadFile(doc)}
                                  className="p-2.5 rounded-xl hover:bg-pink-500/20 text-purple-300/50 hover:text-pink-300 transition-colors"
                                  title="Descargar"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Download className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                  onClick={() => confirmDelete(doc)}
                                  className="p-2.5 rounded-xl hover:bg-red-500/20 text-purple-300/50 hover:text-red-400 transition-colors"
                                  title="Eliminar"
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
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Subir documento"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* File drop zone */}
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
                <p className="text-purple-200/70 text-lg">Toca para seleccionar archivo</p>
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
            options={CATEGORIA_OPTIONS}
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as CategoriaDocumento)}
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
              isLoading={uploading}
              disabled={!selectedFile || !nombre}
              className="flex-1"
            >
              Subir
            </Button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={selectedDoc?.nombre}
        size="lg"
      >
        {selectedDoc && (
          <div className="max-h-[70vh] overflow-auto rounded-xl">
            {isImageFile(selectedDoc.archivo_nombre || '') ? (
              <img
                src={selectedDoc.archivo_url}
                alt={selectedDoc.nombre}
                className="w-full rounded-xl"
              />
            ) : isPdfFile(selectedDoc.archivo_nombre || '') ? (
              <iframe
                src={selectedDoc.archivo_url}
                className="w-full h-[60vh] rounded-xl bg-white"
                title={selectedDoc.nombre}
              />
            ) : null}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar documento"
        message={`Estas seguro de que quieres eliminar "${deleteDoc?.nombre}"?`}
        confirmText="Eliminar"
      />
    </PageWrapper>
  );
}

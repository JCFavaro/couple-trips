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
      ) : documentos.length === 0 ? (
        <motion.div
          className="glass-card"
          style={{ padding: 40, textAlign: 'center' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <FolderOpen style={{ width: 56, height: 56, margin: '0 auto', color: 'var(--theme-secondary)', opacity: 0.3, marginBottom: 16 }} />
          <p style={{ color: 'var(--theme-text-muted)', fontSize: 18 }}>No hay documentos guardados</p>
          <p style={{ color: 'var(--theme-secondary)', opacity: 0.4, fontSize: 14, marginTop: 8 }}>Sube reservas, tickets y mas</p>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    padding: 10,
                    borderRadius: 12,
                    background: 'var(--glass-bg-1)',
                    border: '1px solid var(--glass-border)'
                  }}>
                    <Icon style={{ width: 20, height: 20, color: 'var(--theme-accent)' }} />
                  </div>
                  <h3 style={{ fontWeight: 600, color: 'white', fontSize: 18, textTransform: 'capitalize' }}>{cat}</h3>
                  <span style={{ color: 'var(--theme-text-muted)', fontSize: 14 }}>({docs.length})</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                          <div className="glass-card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                              {/* Thumbnail or icon */}
                              <div style={{
                                width: 64,
                                height: 64,
                                borderRadius: 12,
                                background: 'var(--glass-bg-1)',
                                border: '1px solid var(--glass-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                overflow: 'hidden'
                              }}>
                                {isImage ? (
                                  <img
                                    src={doc.archivo_url}
                                    alt={doc.nombre}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}
                                  />
                                ) : (
                                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--theme-text-muted)' }}>{ext}</span>
                                )}
                              </div>

                              {/* Info */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 500, color: 'white', fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {doc.nombre}
                                </p>
                                <p style={{ fontSize: 14, color: 'var(--theme-text-muted)', marginTop: 8 }}>
                                  {formatDate(doc.created_at)}
                                  {doc.uploaded_by && (
                                    <span style={{
                                      marginLeft: 12,
                                      padding: '4px 10px',
                                      borderRadius: 8,
                                      fontSize: 12,
                                      background: 'var(--glass-bg-1)',
                                      border: '1px solid var(--glass-border)',
                                      color: 'var(--theme-text-muted)'
                                    }}>
                                      {doc.uploaded_by}
                                    </span>
                                  )}
                                </p>
                              </div>

                              {/* Actions */}
                              <div style={{ display: 'flex', gap: 8 }}>
                                {(isImage || isPdf) && (
                                  <motion.button
                                    onClick={() => openPreview(doc)}
                                    style={{
                                      padding: 10,
                                      borderRadius: 12,
                                      background: 'var(--glass-bg-1)',
                                      border: '1px solid var(--glass-border)',
                                      color: 'var(--theme-text-muted)',
                                      cursor: 'pointer'
                                    }}
                                    title="Ver"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Eye style={{ width: 16, height: 16 }} />
                                  </motion.button>
                                )}
                                <motion.button
                                  onClick={() => downloadFile(doc)}
                                  style={{
                                    padding: 10,
                                    borderRadius: 12,
                                    background: 'var(--glass-bg-2)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'var(--theme-accent)',
                                    cursor: 'pointer'
                                  }}
                                  title="Descargar"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Download style={{ width: 16, height: 16 }} />
                                </motion.button>
                                <motion.button
                                  onClick={() => confirmDelete(doc)}
                                  style={{
                                    padding: 10,
                                    borderRadius: 12,
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    color: 'rgba(248, 113, 113, 0.6)',
                                    cursor: 'pointer'
                                  }}
                                  title="Eliminar"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Trash2 style={{ width: 16, height: 16 }} />
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* File drop zone */}
          <motion.div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--glass-border)',
              borderRadius: 16,
              padding: 32,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            whileHover={{ scale: 1.02, borderColor: 'var(--theme-accent)' }}
            whileTap={{ scale: 0.98 }}
          >
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx"
            />
            {selectedFile ? (
              <div>
                <div style={{
                  width: 56,
                  height: 56,
                  margin: '0 auto',
                  borderRadius: 12,
                  background: 'var(--tab-active-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16
                }}>
                  <File style={{ width: 28, height: 28, color: 'white' }} />
                </div>
                <p style={{ color: 'white', fontWeight: 500, fontSize: 18 }}>{selectedFile.name}</p>
                <p style={{ color: 'var(--theme-text-muted)', fontSize: 14, marginTop: 8 }}>
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <div style={{
                  width: 56,
                  height: 56,
                  margin: '0 auto',
                  borderRadius: 12,
                  background: 'var(--glass-bg-1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16
                }}>
                  <Upload style={{ width: 28, height: 28, color: 'var(--theme-text-muted)' }} />
                </div>
                <p style={{ color: 'var(--theme-accent)', fontSize: 18 }}>Toca para seleccionar archivo</p>
                <p style={{ color: 'var(--theme-text-muted)', fontSize: 14, marginTop: 8 }}>PDF, imagenes o documentos</p>
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
              isLoading={uploading}
              disabled={!selectedFile || !nombre}
              style={{ flex: 1 }}
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

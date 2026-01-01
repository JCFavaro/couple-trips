import { useState, useEffect, useCallback } from 'react';
import { getDocumentos, uploadDocumento, deleteDocumento, supabase } from '../lib/supabase';
import type { Documento, CategoriaDocumento } from '../types';

export function useDocumentos() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchDocumentos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDocumentos();
      setDocumentos(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los documentos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocumentos();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('documentos-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'documentos' },
        () => {
          fetchDocumentos();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchDocumentos]);

  const upload = async (
    file: File,
    nombre: string,
    categoria: CategoriaDocumento,
    uploadedBy?: string
  ): Promise<boolean> => {
    try {
      setUploading(true);
      const result = await uploadDocumento(file, nombre, categoria, uploadedBy);
      if (result) {
        setDocumentos((prev) => [result, ...prev]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error uploading documento:', err);
      return false;
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string, archivoUrl: string): Promise<boolean> => {
    try {
      const success = await deleteDocumento(id, archivoUrl);
      if (success) {
        setDocumentos((prev) => prev.filter((d) => d.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting documento:', err);
      return false;
    }
  };

  // Group by category
  const byCategory = documentos.reduce((acc, doc) => {
    const cat = doc.categoria as CategoriaDocumento;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(doc);
    return acc;
  }, {} as Record<CategoriaDocumento, Documento[]>);

  return {
    documentos,
    byCategory,
    loading,
    error,
    uploading,
    upload,
    remove,
    refresh: fetchDocumentos,
  };
}

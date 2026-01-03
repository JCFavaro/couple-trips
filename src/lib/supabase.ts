import { createClient } from '@supabase/supabase-js';
import type {
  Trip,
  Gasto,
  GastoPago,
  Itinerario,
  Documento,
  Lugar,
  Nota,
  TripConfig,
  GastoFormData,
  GastoPagoFormData,
  ItinerarioFormData,
  LugarFormData,
  NotaFormData,
} from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// ============ TRIPS ============
export async function getTrips(): Promise<Trip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .order('fecha_inicio', { ascending: true });

  if (error) {
    console.error('Error fetching trips:', error);
    return [];
  }
  return data || [];
}

export async function getTrip(tripId: string): Promise<Trip | null> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single();

  if (error) {
    console.error('Error fetching trip:', error);
    return null;
  }
  return data;
}

export async function updateTrip(tripId: string, updates: Partial<Trip>): Promise<Trip | null> {
  const { data, error } = await supabase
    .from('trips')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', tripId)
    .select()
    .single();

  if (error) {
    console.error('Error updating trip:', error);
    return null;
  }
  return data;
}

// ============ TRIP CONFIG (Legacy - now use trips table) ============
export async function getTripConfig(): Promise<TripConfig | null> {
  const { data, error } = await supabase
    .from('trip_config')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching trip config:', error);
    return null;
  }
  return data;
}

export async function updateTripConfig(config: Partial<TripConfig>): Promise<TripConfig | null> {
  const { data, error } = await supabase
    .from('trip_config')
    .update({ ...config, updated_at: new Date().toISOString() })
    .eq('id', config.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating trip config:', error);
    return null;
  }
  return data;
}

// ============ GASTOS ============
export async function getGastos(tripId: string): Promise<Gasto[]> {
  const { data, error } = await supabase
    .from('gastos')
    .select('*')
    .eq('trip_id', tripId)
    .order('fecha', { ascending: false });

  if (error) {
    console.error('Error fetching gastos:', error);
    return [];
  }
  return data || [];
}

export async function createGasto(tripId: string, gasto: GastoFormData, montoUsd: number): Promise<Gasto | null> {
  const { data, error } = await supabase
    .from('gastos')
    .insert({
      trip_id: tripId,
      fecha: gasto.fecha,
      concepto: gasto.concepto,
      categoria: gasto.categoria,
      pagador: gasto.cuotas_total === 1 ? gasto.pagador : null,
      monto: gasto.monto,
      moneda: gasto.moneda,
      monto_usd: montoUsd,
      cuotas_total: gasto.cuotas_total,
      descripcion: gasto.descripcion,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating gasto:', error);
    return null;
  }
  return data;
}

export async function updateGasto(id: string, gasto: Partial<GastoFormData>, montoUsd?: number): Promise<Gasto | null> {
  const updateData: Record<string, unknown> = {
    ...gasto,
    updated_at: new Date().toISOString(),
  };

  // Si cuotas_total es 1, pagador es requerido; si >1, pagador es null
  if (gasto.cuotas_total !== undefined) {
    updateData.pagador = gasto.cuotas_total === 1 ? gasto.pagador : null;
  }

  if (montoUsd !== undefined) {
    updateData.monto_usd = montoUsd;
  }

  const { data, error } = await supabase
    .from('gastos')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating gasto:', error);
    return null;
  }
  return data;
}

export async function deleteGasto(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('gastos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting gasto:', error);
    return false;
  }
  return true;
}

// ============ GASTO PAGOS (Cuotas) ============
export async function getGastoPagos(tripId: string): Promise<GastoPago[]> {
  const { data, error } = await supabase
    .from('gasto_pagos')
    .select('*')
    .eq('trip_id', tripId)
    .order('fecha_pago', { ascending: false });

  if (error) {
    console.error('Error fetching gasto pagos:', error);
    return [];
  }
  return data || [];
}

export async function getGastoPagosByGasto(gastoId: string): Promise<GastoPago[]> {
  const { data, error } = await supabase
    .from('gasto_pagos')
    .select('*')
    .eq('gasto_id', gastoId)
    .order('numero_cuota', { ascending: true });

  if (error) {
    console.error('Error fetching gasto pagos for gasto:', error);
    return [];
  }
  return data || [];
}

export async function createGastoPago(tripId: string, pago: GastoPagoFormData): Promise<GastoPago | null> {
  const { data, error } = await supabase
    .from('gasto_pagos')
    .insert({
      trip_id: tripId,
      ...pago,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating gasto pago:', error);
    return null;
  }
  return data;
}

export async function deleteGastoPago(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('gasto_pagos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting gasto pago:', error);
    return false;
  }
  return true;
}

// ============ ITINERARIO ============
export async function getItinerario(tripId: string): Promise<Itinerario[]> {
  const { data, error } = await supabase
    .from('itinerario')
    .select('*')
    .eq('trip_id', tripId)
    .order('fecha', { ascending: true })
    .order('orden', { ascending: true });

  if (error) {
    console.error('Error fetching itinerario:', error);
    return [];
  }
  return data || [];
}

export async function createItinerario(tripId: string, item: ItinerarioFormData): Promise<Itinerario | null> {
  // Get max orden for the date
  const { data: existing } = await supabase
    .from('itinerario')
    .select('orden')
    .eq('trip_id', tripId)
    .eq('fecha', item.fecha)
    .order('orden', { ascending: false })
    .limit(1);

  const nextOrden = existing && existing.length > 0 ? existing[0].orden + 1 : 0;

  const { data, error } = await supabase
    .from('itinerario')
    .insert({
      trip_id: tripId,
      ...item,
      orden: nextOrden,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating itinerario:', error);
    return null;
  }
  return data;
}

export async function updateItinerario(id: string, item: Partial<ItinerarioFormData>): Promise<Itinerario | null> {
  const { data, error } = await supabase
    .from('itinerario')
    .update(item)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating itinerario:', error);
    return null;
  }
  return data;
}

export async function deleteItinerario(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('itinerario')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting itinerario:', error);
    return false;
  }
  return true;
}

// ============ DOCUMENTOS ============
export async function getDocumentos(tripId: string): Promise<Documento[]> {
  const { data, error } = await supabase
    .from('documentos')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching documentos:', error);
    return [];
  }
  return data || [];
}

export async function uploadDocumento(
  tripId: string,
  file: File,
  nombre: string,
  categoria: string,
  uploadedBy?: string
): Promise<Documento | null> {
  // Upload file to storage (organized by trip)
  const fileName = `${tripId}/${Date.now()}_${file.name}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documentos')
    .upload(fileName, file);

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    return null;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('documentos')
    .getPublicUrl(uploadData.path);

  // Create document record
  const { data, error } = await supabase
    .from('documentos')
    .insert({
      trip_id: tripId,
      nombre,
      categoria,
      archivo_url: urlData.publicUrl,
      archivo_nombre: file.name,
      uploaded_by: uploadedBy,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating documento record:', error);
    return null;
  }
  return data;
}

export async function deleteDocumento(id: string, archivoUrl: string): Promise<boolean> {
  // Extract file path from URL
  const urlParts = archivoUrl.split('/');
  // The path includes trip_id/filename now
  const pathIndex = urlParts.findIndex(p => p === 'documentos') + 1;
  const filePath = urlParts.slice(pathIndex).join('/');

  // Delete from storage
  await supabase.storage
    .from('documentos')
    .remove([filePath]);

  // Delete record
  const { error } = await supabase
    .from('documentos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting documento:', error);
    return false;
  }
  return true;
}

// ============ LUGARES ============
export async function getLugares(tripId: string): Promise<Lugar[]> {
  const { data, error } = await supabase
    .from('lugares')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching lugares:', error);
    return [];
  }
  return data || [];
}

export async function createLugar(tripId: string, lugar: LugarFormData): Promise<Lugar | null> {
  const { data, error } = await supabase
    .from('lugares')
    .insert({
      trip_id: tripId,
      ...lugar,
      visitado: false,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating lugar:', error);
    return null;
  }
  return data;
}

export async function updateLugar(id: string, lugar: Partial<LugarFormData & { visitado: boolean }>): Promise<Lugar | null> {
  const { data, error } = await supabase
    .from('lugares')
    .update(lugar)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating lugar:', error);
    return null;
  }
  return data;
}

export async function deleteLugar(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('lugares')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting lugar:', error);
    return false;
  }
  return true;
}

// ============ NOTAS ============
export async function getNotas(tripId: string): Promise<Nota[]> {
  const { data, error } = await supabase
    .from('notas')
    .select('*')
    .eq('trip_id', tripId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching notas:', error);
    return [];
  }
  return data || [];
}

export async function createNota(tripId: string, nota: NotaFormData): Promise<Nota | null> {
  const { data, error } = await supabase
    .from('notas')
    .insert({
      trip_id: tripId,
      ...nota,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating nota:', error);
    return null;
  }
  return data;
}

export async function updateNota(id: string, nota: Partial<NotaFormData>): Promise<Nota | null> {
  const { data, error } = await supabase
    .from('notas')
    .update({
      ...nota,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating nota:', error);
    return null;
  }
  return data;
}

export async function deleteNota(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('notas')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting nota:', error);
    return false;
  }
  return true;
}

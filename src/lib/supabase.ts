import { createClient } from '@supabase/supabase-js';
import type {
  Gasto,
  Itinerario,
  Documento,
  Lugar,
  Nota,
  TripConfig,
  PaymentPlan,
  Payment,
  GastoFormData,
  ItinerarioFormData,
  LugarFormData,
  NotaFormData,
  PaymentPlanFormData,
  PaymentFormData,
} from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// ============ TRIP CONFIG ============
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
export async function getGastos(): Promise<Gasto[]> {
  const { data, error } = await supabase
    .from('gastos')
    .select('*')
    .order('fecha', { ascending: false });

  if (error) {
    console.error('Error fetching gastos:', error);
    return [];
  }
  return data || [];
}

export async function createGasto(gasto: GastoFormData, montoUsd: number): Promise<Gasto | null> {
  const { data, error } = await supabase
    .from('gastos')
    .insert({
      ...gasto,
      monto_usd: montoUsd,
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

// ============ ITINERARIO ============
export async function getItinerario(): Promise<Itinerario[]> {
  const { data, error } = await supabase
    .from('itinerario')
    .select('*')
    .order('fecha', { ascending: true })
    .order('orden', { ascending: true });

  if (error) {
    console.error('Error fetching itinerario:', error);
    return [];
  }
  return data || [];
}

export async function createItinerario(item: ItinerarioFormData): Promise<Itinerario | null> {
  // Get max orden for the date
  const { data: existing } = await supabase
    .from('itinerario')
    .select('orden')
    .eq('fecha', item.fecha)
    .order('orden', { ascending: false })
    .limit(1);

  const nextOrden = existing && existing.length > 0 ? existing[0].orden + 1 : 0;

  const { data, error } = await supabase
    .from('itinerario')
    .insert({
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
export async function getDocumentos(): Promise<Documento[]> {
  const { data, error } = await supabase
    .from('documentos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching documentos:', error);
    return [];
  }
  return data || [];
}

export async function uploadDocumento(
  file: File,
  nombre: string,
  categoria: string,
  uploadedBy?: string
): Promise<Documento | null> {
  // Upload file to storage
  const fileName = `${Date.now()}_${file.name}`;
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
  const fileName = urlParts[urlParts.length - 1];

  // Delete from storage
  await supabase.storage
    .from('documentos')
    .remove([fileName]);

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
export async function getLugares(): Promise<Lugar[]> {
  const { data, error } = await supabase
    .from('lugares')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching lugares:', error);
    return [];
  }
  return data || [];
}

export async function createLugar(lugar: LugarFormData): Promise<Lugar | null> {
  const { data, error } = await supabase
    .from('lugares')
    .insert({
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
export async function getNotas(): Promise<Nota[]> {
  const { data, error } = await supabase
    .from('notas')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching notas:', error);
    return [];
  }
  return data || [];
}

export async function createNota(nota: NotaFormData): Promise<Nota | null> {
  const { data, error } = await supabase
    .from('notas')
    .insert({
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

// ============ PAYMENT PLANS ============
export async function getPaymentPlans(): Promise<PaymentPlan[]> {
  const { data, error } = await supabase
    .from('payment_plans')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching payment plans:', error);
    return [];
  }
  return data || [];
}

export async function createPaymentPlan(plan: PaymentPlanFormData): Promise<PaymentPlan | null> {
  const { data, error } = await supabase
    .from('payment_plans')
    .insert({
      ...plan,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating payment plan:', error);
    return null;
  }
  return data;
}

export async function updatePaymentPlan(id: string, plan: Partial<PaymentPlanFormData>): Promise<PaymentPlan | null> {
  const { data, error } = await supabase
    .from('payment_plans')
    .update({
      ...plan,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating payment plan:', error);
    return null;
  }
  return data;
}

export async function deletePaymentPlan(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('payment_plans')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting payment plan:', error);
    return false;
  }
  return true;
}

// ============ PAYMENTS ============
export async function getPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('fecha_pago', { ascending: false });

  if (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
  return data || [];
}

export async function getPaymentsByPlan(planId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('plan_id', planId)
    .order('numero_cuota', { ascending: true });

  if (error) {
    console.error('Error fetching payments for plan:', error);
    return [];
  }
  return data || [];
}

export async function createPayment(payment: PaymentFormData): Promise<Payment | null> {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      ...payment,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating payment:', error);
    return null;
  }
  return data;
}

export async function deletePayment(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting payment:', error);
    return false;
  }
  return true;
}

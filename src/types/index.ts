// Database types for Supabase

// ============ TRIPS ============
export interface Trip {
  id: string;
  nombre: string;
  destino: string;
  emoji: string;
  theme: TripTheme;
  fecha_inicio: string;
  fecha_fin: string;
  dolar_blue_rate: number;
  color_primary: string;
  color_secondary: string;
  color_bg: string;
  created_at: string;
  updated_at: string;
}

export type TripTheme = 'orlando' | 'chile' | 'default';

export interface TripThemeConfig {
  name: string;
  primary: string;
  secondary: string;
  bg: string;
  bgGradient: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
}

export const TRIP_THEMES: Record<TripTheme, TripThemeConfig> = {
  orlando: {
    name: 'Orlando Magic',
    primary: '#ec4899',
    secondary: '#8b5cf6',
    bg: '#1a0a2e',
    bgGradient: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 100%)',
    cardBg: 'rgba(139, 92, 246, 0.1)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(192, 132, 252, 0.7)',
    accent: '#f472b6',
  },
  chile: {
    name: 'Chile Adventure',
    primary: '#dc2626',
    secondary: '#1d4ed8',
    bg: '#0f172a',
    bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    cardBg: 'rgba(30, 58, 138, 0.15)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(148, 163, 184, 0.8)',
    accent: '#f87171',
  },
  default: {
    name: 'Classic',
    primary: '#6366f1',
    secondary: '#8b5cf6',
    bg: '#18181b',
    bgGradient: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
    cardBg: 'rgba(99, 102, 241, 0.1)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(161, 161, 170, 0.8)',
    accent: '#a78bfa',
  },
};

// Legacy - keeping for backwards compatibility during migration
export interface TripConfig {
  id: string;
  trip_start_date: string;
  trip_end_date: string;
  dolar_blue_rate: number;
  updated_at: string;
}

export interface Gasto {
  id: string;
  trip_id: string;
  fecha: string;
  concepto: string;
  categoria: CategoriaGasto;
  pagador: Pagador | null;  // null si es en cuotas
  monto: number;            // Monto TOTAL
  moneda: Moneda;
  monto_usd: number;        // Total en USD
  cuotas_total: number;     // 1 = pago unico, >1 = cuotas
  descripcion?: string;
  created_at: string;
  updated_at: string;
}

// Pago de cuota individual
export interface GastoPago {
  id: string;
  trip_id: string;
  gasto_id: string;
  numero_cuota: number;
  monto: number;
  pagador: Pagador;
  fecha_pago: string;
  notas?: string;
  created_at: string;
}

// Gasto con info de cuotas calculada (para UI)
export interface GastoConPagos extends Gasto {
  pagos: GastoPago[];
  total_pagado: number;
  cuotas_pagadas: number;
  restante: number;
  progreso: number;         // 0-100
  pagado_juan: number;
  pagado_vale: number;
}

export interface Itinerario {
  id: string;
  trip_id: string;
  fecha: string;
  titulo: string;
  descripcion?: string;
  hora?: string;
  ubicacion_url?: string;
  orden: number;
  created_at: string;
}

export interface Documento {
  id: string;
  trip_id: string;
  nombre: string;
  categoria: CategoriaDocumento;
  archivo_url: string;
  archivo_nombre?: string;
  uploaded_by?: string;
  created_at: string;
}

export interface Lugar {
  id: string;
  trip_id: string;
  nombre: string;
  tipo: TipoLugar;
  maps_url?: string;
  notas?: string;
  visitado: boolean;
  created_at: string;
}

export interface Nota {
  id: string;
  trip_id: string;
  titulo: string;
  contenido?: string;
  tipo: TipoNota;
  updated_at: string;
}

// Enums
export type CategoriaGasto =
  | 'vuelos'
  | 'estadia'
  | 'parques'
  | 'comida'
  | 'transporte'
  | 'compras'
  | 'otros';

export type Pagador = 'Juan' | 'Vale';

export type Moneda = 'ARS' | 'USD';

export type CategoriaDocumento =
  | 'reservas'
  | 'tickets'
  | 'vuelos'
  | 'seguro'
  | 'otros';

export type TipoLugar =
  | 'restaurante'
  | 'tienda'
  | 'atraccion'
  | 'tip';

export type TipoNota =
  | 'general'
  | 'llevar'
  | 'comprar';

// Form types
export interface GastoFormData {
  fecha: string;
  concepto: string;
  categoria: CategoriaGasto;
  pagador?: Pagador;        // Solo requerido si cuotas_total = 1
  monto: number;
  moneda: Moneda;
  cuotas_total: number;     // 1 = pago unico, >1 = cuotas
  descripcion?: string;
}

export interface GastoPagoFormData {
  gasto_id: string;
  numero_cuota: number;
  monto: number;
  pagador: Pagador;
  fecha_pago: string;
  notas?: string;
}

export interface ItinerarioFormData {
  fecha: string;
  titulo: string;
  descripcion?: string;
  hora?: string;
  ubicacion_url?: string;
}

export interface LugarFormData {
  nombre: string;
  tipo: TipoLugar;
  maps_url?: string;
  notas?: string;
}

export interface NotaFormData {
  titulo: string;
  contenido?: string;
  tipo: TipoNota;
}

// UI types
export interface CategoryConfig {
  label: string;
  icon: string;
  color: string;
}

export const CATEGORIAS_GASTO: Record<CategoriaGasto, CategoryConfig> = {
  vuelos: { label: 'Vuelos', icon: 'Plane', color: 'bg-blue-500' },
  estadia: { label: 'Estadia', icon: 'Hotel', color: 'bg-purple-500' },
  parques: { label: 'Parques', icon: 'Castle', color: 'bg-pink-500' },
  comida: { label: 'Comida', icon: 'UtensilsCrossed', color: 'bg-orange-500' },
  transporte: { label: 'Transporte', icon: 'Car', color: 'bg-green-500' },
  compras: { label: 'Compras', icon: 'ShoppingBag', color: 'bg-yellow-500' },
  otros: { label: 'Otros', icon: 'MoreHorizontal', color: 'bg-gray-500' },
};

export const CATEGORIAS_DOCUMENTO: Record<CategoriaDocumento, CategoryConfig> = {
  reservas: { label: 'Reservas', icon: 'CalendarCheck', color: 'bg-purple-500' },
  tickets: { label: 'Tickets', icon: 'Ticket', color: 'bg-pink-500' },
  vuelos: { label: 'Vuelos', icon: 'Plane', color: 'bg-blue-500' },
  seguro: { label: 'Seguro', icon: 'Shield', color: 'bg-green-500' },
  otros: { label: 'Otros', icon: 'FileText', color: 'bg-gray-500' },
};

export const TIPOS_LUGAR: Record<TipoLugar, CategoryConfig> = {
  restaurante: { label: 'Restaurante', icon: 'UtensilsCrossed', color: 'bg-orange-500' },
  tienda: { label: 'Tienda', icon: 'Store', color: 'bg-purple-500' },
  atraccion: { label: 'Atraccion', icon: 'Sparkles', color: 'bg-pink-500' },
  tip: { label: 'Tip', icon: 'Lightbulb', color: 'bg-yellow-500' },
};

export const TIPOS_NOTA: Record<TipoNota, CategoryConfig> = {
  general: { label: 'General', icon: 'StickyNote', color: 'bg-blue-500' },
  llevar: { label: 'Que llevar', icon: 'Luggage', color: 'bg-green-500' },
  comprar: { label: 'Que comprar', icon: 'ShoppingCart', color: 'bg-pink-500' },
};

// Balance por moneda
export interface BalanceMoneda {
  total: number;
  juan: number;
  vale: number;
  diferencia: number;
  deudor: Pagador | null;
}

// Balance type (separado por moneda)
export interface Balance {
  usd: BalanceMoneda;
  ars: BalanceMoneda;
  // Totales combinados (para mostrar resumen)
  totalGeneral: {
    usd: number;
    ars: number;
  };
}

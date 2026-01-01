// Database types for Supabase

export interface TripConfig {
  id: string;
  trip_start_date: string;
  trip_end_date: string;
  dolar_blue_rate: number;
  updated_at: string;
}

export interface Gasto {
  id: string;
  fecha: string;
  concepto: string;
  categoria: CategoriaGasto;
  pagador: Pagador;
  monto: number;
  moneda: Moneda;
  monto_usd: number;
  created_at: string;
  updated_at: string;
}

export interface Itinerario {
  id: string;
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
  nombre: string;
  categoria: CategoriaDocumento;
  archivo_url: string;
  archivo_nombre?: string;
  uploaded_by?: string;
  created_at: string;
}

export interface Lugar {
  id: string;
  nombre: string;
  tipo: TipoLugar;
  maps_url?: string;
  notas?: string;
  visitado: boolean;
  created_at: string;
}

export interface Nota {
  id: string;
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
  pagador: Pagador;
  monto: number;
  moneda: Moneda;
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
  estadia: { label: 'Estadía', icon: 'Hotel', color: 'bg-purple-500' },
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
  atraccion: { label: 'Atracción', icon: 'Sparkles', color: 'bg-pink-500' },
  tip: { label: 'Tip', icon: 'Lightbulb', color: 'bg-yellow-500' },
};

export const TIPOS_NOTA: Record<TipoNota, CategoryConfig> = {
  general: { label: 'General', icon: 'StickyNote', color: 'bg-blue-500' },
  llevar: { label: 'Qué llevar', icon: 'Luggage', color: 'bg-green-500' },
  comprar: { label: 'Qué comprar', icon: 'ShoppingCart', color: 'bg-pink-500' },
};

// Balance type
export interface Balance {
  total: number;
  juan: number;
  vale: number;
  diferencia: number;
  deudor: Pagador | null;
}

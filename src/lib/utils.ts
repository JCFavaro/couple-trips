import { differenceInDays, format, parseISO, isAfter, isBefore, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Gasto, Balance } from '../types';

// Date formatting
export function formatDate(date: string | Date, formatStr: string = 'dd MMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr, { locale: es });
}

export function formatTime(time: string | null | undefined): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
}

// Calculate days until trip
export function getDaysUntilTrip(tripStartDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tripDate = parseISO(tripStartDate);
  return differenceInDays(tripDate, today);
}

// Check if currently on trip
export function isOnTrip(startDate: string, endDate: string): boolean {
  const today = new Date();
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  return (isAfter(today, start) || isToday(parseISO(startDate))) &&
         (isBefore(today, end) || isToday(parseISO(endDate)));
}

// Check if trip is over
export function isTripOver(endDate: string): boolean {
  const today = new Date();
  const end = parseISO(endDate);
  return isAfter(today, end);
}

// Calculate balance from gastos
export function calculateBalance(gastos: Gasto[]): Balance {
  let total = 0;
  let juan = 0;
  let vale = 0;

  for (const gasto of gastos) {
    const amount = gasto.monto_usd;
    total += amount;
    if (gasto.pagador === 'Juan') {
      juan += amount;
    } else {
      vale += amount;
    }
  }

  const diferencia = Math.abs(juan - vale) / 2;
  let deudor: 'Juan' | 'Vale' | null = null;

  if (juan > vale) {
    deudor = 'Vale';
  } else if (vale > juan) {
    deudor = 'Juan';
  }

  return {
    total: Number(total.toFixed(2)),
    juan: Number(juan.toFixed(2)),
    vale: Number(vale.toFixed(2)),
    diferencia: Number(diferencia.toFixed(2)),
    deudor,
  };
}

// Format currency
export function formatCurrency(amount: number, currency: 'USD' | 'ARS' = 'USD'): string {
  if (currency === 'USD') {
    return `US$${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// Group itinerario by date
export function groupByDate<T extends { fecha: string }>(items: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  for (const item of items) {
    const existing = grouped.get(item.fecha);
    if (existing) {
      existing.push(item);
    } else {
      grouped.set(item.fecha, [item]);
    }
  }

  return grouped;
}

// Get countdown message
export function getCountdownMessage(daysUntil: number, startDate: string, endDate: string): string {
  if (isOnTrip(startDate, endDate)) {
    return '!Estamos en Orlando!';
  }

  if (isTripOver(endDate)) {
    return 'El viaje ya paso';
  }

  if (daysUntil === 0) {
    return 'Hoy empieza la magia!';
  }

  if (daysUntil === 1) {
    return 'Manana empieza la magia!';
  }

  return `Faltan ${daysUntil} dias para la magia`;
}

// Generate random stars for background
export function generateStars(count: number): Array<{ x: number; y: number; size: number; delay: number; duration: number; opacity: number }> {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
    opacity: Math.random() * 0.5 + 0.3,
  }));
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Get file extension
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

// Check if file is an image
export function isImageFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
}

// Check if file is a PDF
export function isPdfFile(filename: string): boolean {
  return getFileExtension(filename) === 'pdf';
}

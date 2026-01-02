import { differenceInDays, format, parseISO, isAfter, isBefore, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import type { GastoConPagos, Balance } from '../types';

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

// Calculate balance from gastos (separado por moneda, sin conversion)
export function calculateBalance(gastos: GastoConPagos[]): Balance {
  // Separar por moneda
  let juanUsd = 0;
  let valeUsd = 0;
  let juanArs = 0;
  let valeArs = 0;

  for (const gasto of gastos) {
    const isUsd = gasto.moneda === 'USD';

    if (gasto.cuotas_total === 1) {
      // Pago unico - cuenta el pagador del gasto
      if (gasto.pagador === 'Juan') {
        if (isUsd) {
          juanUsd += gasto.monto;
        } else {
          juanArs += gasto.monto;
        }
      } else if (gasto.pagador === 'Vale') {
        if (isUsd) {
          valeUsd += gasto.monto;
        } else {
          valeArs += gasto.monto;
        }
      }
    } else {
      // En cuotas - cuenta cada pago individual (en la moneda del gasto)
      for (const pago of gasto.pagos) {
        if (pago.pagador === 'Juan') {
          if (isUsd) {
            juanUsd += pago.monto;
          } else {
            juanArs += pago.monto;
          }
        } else if (pago.pagador === 'Vale') {
          if (isUsd) {
            valeUsd += pago.monto;
          } else {
            valeArs += pago.monto;
          }
        }
      }
    }
  }

  // Calcular balance USD
  const totalUsd = juanUsd + valeUsd;
  const diferenciaUsd = Math.abs(juanUsd - valeUsd) / 2;
  let deudorUsd: 'Juan' | 'Vale' | null = null;
  if (juanUsd > valeUsd) {
    deudorUsd = 'Vale';
  } else if (valeUsd > juanUsd) {
    deudorUsd = 'Juan';
  }

  // Calcular balance ARS
  const totalArs = juanArs + valeArs;
  const diferenciaArs = Math.abs(juanArs - valeArs) / 2;
  let deudorArs: 'Juan' | 'Vale' | null = null;
  if (juanArs > valeArs) {
    deudorArs = 'Vale';
  } else if (valeArs > juanArs) {
    deudorArs = 'Juan';
  }

  return {
    usd: {
      total: Number(totalUsd.toFixed(2)),
      juan: Number(juanUsd.toFixed(2)),
      vale: Number(valeUsd.toFixed(2)),
      diferencia: Number(diferenciaUsd.toFixed(2)),
      deudor: deudorUsd,
    },
    ars: {
      total: Number(totalArs.toFixed(0)),
      juan: Number(juanArs.toFixed(0)),
      vale: Number(valeArs.toFixed(0)),
      diferencia: Number(diferenciaArs.toFixed(0)),
      deudor: deudorArs,
    },
    totalGeneral: {
      usd: Number(totalUsd.toFixed(2)),
      ars: Number(totalArs.toFixed(0)),
    },
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

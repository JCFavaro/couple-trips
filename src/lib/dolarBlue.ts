const DOLAR_API_URL = 'https://dolarapi.com/v1/dolares/blue';
const CACHE_KEY = 'dolar_blue_rate';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

interface DolarApiResponse {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

interface CachedRate {
  rate: number;
  timestamp: number;
  source: 'api' | 'manual';
}

// Get cached rate from localStorage
function getCachedRate(): CachedRate | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CachedRate = JSON.parse(cached);
    const isExpired = Date.now() - data.timestamp > CACHE_DURATION;

    // Return cached rate if it's from manual input or not expired
    if (data.source === 'manual' || !isExpired) {
      return data;
    }

    return null;
  } catch {
    return null;
  }
}

// Cache the rate in localStorage
function cacheRate(rate: number, source: 'api' | 'manual'): void {
  const data: CachedRate = {
    rate,
    timestamp: Date.now(),
    source,
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
}

// Fetch dolar blue rate from API
export async function fetchDolarBlueRate(): Promise<number | null> {
  // Check cache first
  const cached = getCachedRate();
  if (cached) {
    return cached.rate;
  }

  try {
    const response = await fetch(DOLAR_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DolarApiResponse = await response.json();
    const rate = data.venta; // Using "venta" (sell) rate

    // Cache the rate
    cacheRate(rate, 'api');

    return rate;
  } catch (error) {
    console.error('Error fetching dolar blue rate:', error);
    return null;
  }
}

// Set manual rate (as fallback)
export function setManualDolarRate(rate: number): void {
  cacheRate(rate, 'manual');
}

// Get current rate (cached or fetch)
export async function getDolarBlueRate(fallbackRate: number = 1200): Promise<number> {
  const cached = getCachedRate();
  if (cached) {
    return cached.rate;
  }

  const apiRate = await fetchDolarBlueRate();
  return apiRate ?? fallbackRate;
}

// Convert ARS to USD
export function arsToUsd(ars: number, rate: number): number {
  if (rate <= 0) return 0;
  return Number((ars / rate).toFixed(2));
}

// Convert USD to ARS
export function usdToArs(usd: number, rate: number): number {
  return Number((usd * rate).toFixed(2));
}

// Get formatted rate info
export function getFormattedRate(): string {
  const cached = getCachedRate();
  if (!cached) return 'No disponible';

  const formattedRate = cached.rate.toLocaleString('es-AR');
  const source = cached.source === 'api' ? 'API' : 'Manual';
  return `$${formattedRate} (${source})`;
}

// Clear cached rate (to force refresh)
export function clearCachedRate(): void {
  localStorage.removeItem(CACHE_KEY);
}

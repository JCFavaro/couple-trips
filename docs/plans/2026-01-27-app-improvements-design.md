# Couple Trips - App Improvements Design
**Date:** 2026-01-27
**Status:** Approved

## Overview
Comprehensive improvement plan for the Couple Trips PWA, focusing on editable trip dates and holistic app enhancements across features, automation, performance, and UX.

## Implementation Order
1. Fechas editables en Configuración
2. Automatización del dólar blue
3. Features nuevas (gráficos y PDF export)
4. PWA/Performance (modo offline)
5. UX polish (animaciones y micro-interacciones)

---

## 1. Fechas Editables en Configuración

### Objetivo
Permitir editar las fechas de inicio y fin de viajes existentes desde la página de Configuración.

### Arquitectura
- Extender `src/pages/Config.tsx` con inputs de fecha
- Reutilizar patrón existente del dólar blue rate
- Usar función `updateTrip()` de `src/lib/supabase.ts`

### Componentes
```tsx
// Card con inputs nativos HTML type="date"
<input
  type="date"
  value={fechaInicio}
  onChange={(e) => setFechaInicio(e.target.value)}
/>
<input
  type="date"
  value={fechaFin}
  onChange={(e) => setFechaFin(e.target.value)}
  min={fechaInicio} // Validación: fin >= inicio
/>
```

### Flujo de datos
1. Config page lee `currentTrip.fecha_inicio` y `currentTrip.fecha_fin` del TripContext
2. Usuario edita fechas en inputs nativos
3. Validación: `fecha_fin >= fecha_inicio`
4. Al guardar: `updateTrip(tripId, { fecha_inicio, fecha_fin })`
5. Refresh TripContext con `refreshTrips()`

### Estado local
```tsx
const [fechaInicio, setFechaInicio] = useState(currentTrip?.fecha_inicio || '');
const [fechaFin, setFechaFin] = useState(currentTrip?.fecha_fin || '');
const [saving, setSaving] = useState(false);
```

### UX
- Mostrar fechas formateadas en trip selector Home
- Loading state en botón mientras guarda
- Toast de éxito/error
- Deshabilitar guardar si validación falla

### Files to modify
- `src/pages/Config.tsx` - agregar inputs y lógica de guardado
- `src/pages/Home.tsx` - mostrar fechas formateadas en cards de trips

---

## 2. Automatización del Dólar Blue

### Problema
Actualización manual del dólar blue rate es tediosa y propensa a olvidos, afectando precisión de cálculos ARS→USD.

### Solución
Auto-actualización vía API pública de dólar blue.

### API: dolarapi.com
```typescript
// Endpoint
GET https://dolarapi.com/v1/dolares/blue

// Response
{
  "compra": 1155,
  "venta": 1175,  // ← Usamos este (rate de venta)
  "fecha": "2026-01-27T14:30:00.000Z"
}
```

### Arquitectura

#### Nuevo hook: `useDolarBlue()`
```tsx
export function useDolarBlue() {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  async function fetchRate() {
    // 1. Check localStorage cache (< 6 horas)
    // 2. Si stale, fetch de API
    // 3. Actualizar localStorage + Supabase
    // 4. Fallback a Supabase si API falla
  }

  return { rate, loading, lastUpdate, refresh: fetchRate };
}
```

#### Estrategia de caché
```typescript
// localStorage structure
{
  "dolarBlueCache": {
    "rate": 1175,
    "fetchedAt": 1738012800000,
    "source": "dolarapi.com"
  }
}

// Cache invalidation
- Auto-refresh si cache > 6 horas
- Manual refresh button en Config
- Al entrar a Gastos, check si > 24hs y refrescar silenciosamente
```

#### Auto-refresh triggers
- Al abrir página Gastos (si >24hs)
- Al abrir Config (mostrar "Actualizando...")
- Botón manual "🔄 Actualizar dólar" en Config

#### Error handling
```typescript
try {
  const response = await fetch('https://dolarapi.com/v1/dolares/blue');
  const data = await response.json();
  const rate = data.venta;

  // Save to localStorage + Supabase
  localStorage.setItem('dolarBlueCache', JSON.stringify({
    rate,
    fetchedAt: Date.now(),
    source: 'dolarapi.com'
  }));

  await updateTripDolarRate(rate);

} catch (error) {
  // Fallback: usar rate actual de Supabase
  console.warn('Failed to fetch dólar blue, using cached value');
  showToast('No se pudo actualizar, usando último valor conocido');
}
```

#### UI indicators
- En Config: "Actualizado hace 2 horas" debajo del rate
- Botón "🔄 Actualizar ahora"
- Loading spinner mientras fetchea
- Verde si actualización reciente (<6hs), amarillo si >6hs

### Files to create/modify
- `src/hooks/useDolarBlue.ts` - nuevo hook
- `src/pages/Config.tsx` - integrar auto-update + indicador
- `src/pages/Gastos.tsx` - silent auto-refresh al montar

---

## 3. Features Nuevas

### 3.1 Gráficos de Gastos

#### Objetivo
Visualizar distribución de gastos para mejor comprensión del presupuesto.

#### Librería: Recharts
```bash
npm install recharts
```

#### Componentes

**Gráfico de torta - Gastos por categoría**
```tsx
<PieChart>
  <Pie
    data={[
      { name: 'Vuelos', value: 3500, fill: '#3b82f6' },
      { name: 'Estadia', value: 2800, fill: '#8b5cf6' },
      { name: 'Parques', value: 1200, fill: '#ec4899' },
      // ...
    ]}
    label
  />
</PieChart>
```

**Gráfico de barras - Juan vs Vale**
```tsx
<BarChart data={balanceData}>
  <Bar dataKey="juan" fill="var(--theme-primary)" />
  <Bar dataKey="vale" fill="var(--theme-secondary)" />
</BarChart>
```

**Timeline - Gastos día a día**
```tsx
<LineChart data={dailyExpenses}>
  <Line
    type="monotone"
    dataKey="total"
    stroke="var(--theme-accent)"
  />
</LineChart>
```

#### Ubicación
Nueva tab en Gastos:
```
[ Resumen ] [ Lista ] [ Estadísticas ]
                        ↑ Aquí los gráficos
```

#### Datos mostrados
- **Total por categoría** (convertido a USD para comparar)
- **Balance individual acumulado** (Juan vs Vale)
- **Gasto promedio diario**
- **Proyección:** "A este ritmo gastarán $X,XXX USD en total"
  - Cálculo: `(totalGastado / díasTranscurridos) * díasTotales`

#### Responsive design
- Mobile: Gráficos apilados verticalmente
- Desktop: Grid 2 columnas

### 3.2 Export a PDF

#### Objetivo
Generar reporte descargable con resumen de gastos.

#### Librería: jsPDF + jspdf-autotable
```bash
npm install jspdf jspdf-autotable
```

#### Estructura del PDF
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  REPORTE DE GASTOS
  Orlando 2026
  15 Mar 2026 - 22 Mar 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BALANCE TOTAL
──────────────────────────────
Total gastado: $8,500 USD
Juan: $4,300 | Vale: $4,200
Diferencia: Juan debe $100 a Vale

GASTOS POR CATEGORÍA
┌─────────────┬──────────┬─────────┐
│ Categoría   │   USD    │    %    │
├─────────────┼──────────┼─────────┤
│ Vuelos      │ $3,500   │  41.2%  │
│ Estadia     │ $2,800   │  32.9%  │
│ Parques     │ $1,200   │  14.1%  │
│ Comida      │   $800   │   9.4%  │
│ Otros       │   $200   │   2.4%  │
└─────────────┴──────────┴─────────┘

DETALLE DE GASTOS
┌────────────┬────────────────┬───────────┬─────────┬──────────┐
│   Fecha    │    Concepto    │ Categoría │ Pagador │   Monto  │
├────────────┼────────────────┼───────────┼─────────┼──────────┤
│ 15/03/2026 │ Vuelos AR      │ Vuelos    │ Juan    │ $1,750   │
│ 15/03/2026 │ Hotel Disney   │ Estadia   │ Vale    │ $2,800   │
│ 16/03/2026 │ Magic Kingdom  │ Parques   │ Juan    │   $400   │
...
└────────────┴────────────────┴───────────┴─────────┴──────────┘

Generado el 27/01/2026
```

#### Implementación
```tsx
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function exportToPDF() {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text('REPORTE DE GASTOS', 105, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text(currentTrip.nombre, 105, 30, { align: 'center' });

  // Balance
  doc.setFontSize(12);
  doc.text('BALANCE TOTAL', 20, 50);
  // ...

  // Tabla de categorías
  autoTable(doc, {
    startY: 70,
    head: [['Categoría', 'USD', '%']],
    body: categoryData,
  });

  // Tabla de gastos detallados
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [['Fecha', 'Concepto', 'Categoría', 'Pagador', 'Monto']],
    body: gastosData,
  });

  // Save
  doc.save(`gastos-${currentTrip.nombre.toLowerCase()}-${new Date().getFullYear()}.pdf`);
}
```

#### UI
- Botón "📥 Exportar PDF" en header de Gastos
- Loading indicator mientras genera
- Toast: "PDF descargado exitosamente"

### Files to create/modify
- `src/pages/Gastos.tsx` - agregar tab Estadísticas + botón Export
- `src/components/charts/` - nuevos componentes de gráficos
  - `ExpensesPieChart.tsx`
  - `BalanceBarChart.tsx`
  - `DailyTimelineChart.tsx`
- `src/utils/exportPDF.ts` - lógica de generación PDF

---

## 4. PWA/Performance (Modo Offline)

### Problema
Sin conexión, la app no funciona. Crítico durante viajes (aviones, zonas sin WiFi).

### Solución: Offline-First Architecture

### 4.1 Service Worker con Workbox

#### Instalación
```bash
npm install workbox-webpack-plugin
```

#### Estrategias de caché por tipo

**Static assets (JS, CSS, fonts, images)**
```typescript
// Cache-First: Sirve del cache, actualiza en background
new CacheFirst({
  cacheName: 'static-resources',
  plugins: [
    new ExpirationPlugin({
      maxAgeSeconds: 7 * 24 * 60 * 60, // 1 semana
    }),
  ],
});
```

**API calls (GET requests a Supabase)**
```typescript
// Network-First con Fallback
new NetworkFirst({
  cacheName: 'api-cache',
  networkTimeoutSeconds: 3,
  plugins: [
    new ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 5 * 60, // 5 minutos
    }),
  ],
});
```

**POST/PUT/DELETE mutations**
```typescript
// Background Sync Queue
const queue = new Queue('supabase-mutations', {
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request);
      } catch (error) {
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
  },
});
```

### 4.2 IndexedDB para storage offline

#### Estructura
```typescript
// DB: couple-trips-offline
// Stores:
{
  trips: Trip[],
  gastos: Gasto[],
  itinerario: Itinerario[],
  documentos: Documento[],
  lugares: Lugar[],
  notas: Nota[],
  pendingMutations: PendingMutation[], // Queue de operaciones offline
}
```

#### Librería: Dexie.js
```bash
npm install dexie
```

```typescript
import Dexie from 'dexie';

class CoupleTripsDB extends Dexie {
  trips: Dexie.Table<Trip, string>;
  gastos: Dexie.Table<Gasto, string>;
  // ...

  constructor() {
    super('CoupleTripsDB');
    this.version(1).stores({
      trips: 'id, nombre',
      gastos: 'id, trip_id, fecha',
      // ...
      pendingMutations: '++id, timestamp, type',
    });
  }
}

export const db = new CoupleTripsDB();
```

### 4.3 Optimistic UI Updates

#### Flujo al agregar gasto offline
```typescript
async function createGastoOffline(gasto: GastoFormData) {
  // 1. Generar ID temporal
  const tempId = `temp-${Date.now()}`;

  // 2. Guardar en IndexedDB local
  const newGasto = { ...gasto, id: tempId };
  await db.gastos.add(newGasto);

  // 3. Actualizar UI inmediatamente
  setGastos(prev => [newGasto, ...prev]);

  // 4. Encolar para sync cuando vuelva conexión
  await db.pendingMutations.add({
    type: 'CREATE_GASTO',
    data: gasto,
    tempId,
    timestamp: Date.now(),
  });

  // 5. Mostrar toast
  showToast('Gasto guardado (se sincronizará cuando haya conexión)');
}
```

#### Background Sync Worker
```typescript
// Al recuperar conexión
self.addEventListener('sync', event => {
  if (event.tag === 'sync-mutations') {
    event.waitUntil(syncPendingMutations());
  }
});

async function syncPendingMutations() {
  const pending = await db.pendingMutations.toArray();

  for (const mutation of pending) {
    try {
      // Ejecutar en Supabase
      const result = await executeMutation(mutation);

      // Actualizar ID temporal con ID real
      if (mutation.tempId) {
        await db.gastos.update(mutation.tempId, { id: result.id });
      }

      // Eliminar de queue
      await db.pendingMutations.delete(mutation.id);

    } catch (error) {
      // Retry con exponential backoff
      await scheduleMutationRetry(mutation);
    }
  }
}
```

### 4.4 Indicador de estado de conexión

#### Componente: `<ConnectionStatus />`
```tsx
export function ConnectionStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    window.addEventListener('online', () => setOnline(true));
    window.addEventListener('offline', () => setOnline(false));
    // ...
  }, []);

  if (online && !syncing) return null;

  return (
    <div className="connection-banner">
      {syncing && '🔄 Sincronizando...'}
      {!online && '🟡 Offline - Tus cambios se guardarán'}
    </div>
  );
}
```

#### Estados
- **🟢 Online:** No mostrar nada (UI limpio)
- **🟡 Offline:** Banner amarillo "Offline - Tus cambios se guardarán cuando vuelva la conexión"
- **🔄 Sincronizando:** Banner azul "Sincronizando X cambios pendientes..."
- **✅ Sincronizado:** Toast verde temporal "Todos los cambios sincronizados"

### 4.5 Optimización de Bundle

#### Code splitting por ruta
```tsx
// App.tsx
const Gastos = lazy(() => import('./pages/Gastos'));
const Itinerario = lazy(() => import('./pages/Itinerario'));
const Documentos = lazy(() => import('./pages/Documentos'));
// ...

<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/gastos" element={<Gastos />} />
    {/* ... */}
  </Routes>
</Suspense>
```

#### Tree shaking de lucide-react
```tsx
// ❌ Antes (importa TODO lucide-react)
import { Heart, Sparkles, TrendingUp } from 'lucide-react';

// ✅ Después (importa solo lo necesario)
import Heart from 'lucide-react/dist/esm/icons/heart';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
```

#### Comprimir assets
```bash
# Optimizar PNGs
npm install imagemin imagemin-pngquant -D

# Configurar en build
imagemin(['public/*.png'], {
  destination: 'public/optimized',
  plugins: [
    imageminPngquant({ quality: [0.6, 0.8] })
  ]
});
```

#### Lighthouse targets
- **Performance:** >90
- **Accessibility:** >95
- **Best Practices:** >90
- **SEO:** >90
- **PWA:** 100

### Files to create/modify
- `public/service-worker.js` - Workbox config
- `src/lib/db.ts` - Dexie IndexedDB setup
- `src/hooks/useOfflineSync.ts` - hook para manejar sync
- `src/components/ConnectionStatus.tsx` - indicador UI
- `src/App.tsx` - lazy loading de rutas
- `vite.config.ts` - PWA plugin config

---

## 5. UX Polish

### Objetivo
Elevar la app de funcional a delightful con animaciones fluidas y micro-interacciones.

### 5.1 Animaciones de Transición (Framer Motion)

Ya tienen `framer-motion` instalado. Extender su uso.

#### Page transitions
```tsx
// src/components/PageTransition.tsx
export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
```

#### Modal enter/exit
```tsx
<AnimatePresence>
  {isOpen && (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      />

      {/* Modal content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {children}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

#### List stagger animation
```tsx
<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {gastos.map((gasto, i) => (
    <motion.div
      key={gasto.id}
      variants={itemVariants}
      custom={i}
    >
      <GastoCard gasto={gasto} />
    </motion.div>
  ))}
</motion.div>

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};
```

#### Card hover lift
```tsx
<motion.div
  whileHover={{
    y: -4,
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
  }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.2 }}
>
  <Card />
</motion.div>
```

### 5.2 Micro-interacciones

#### Agregar gasto - Success celebration
```tsx
async function handleCreateGasto() {
  await createGasto(data);

  // 1. Checkmark animado
  setShowSuccess(true);

  // 2. Confetti particles
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.6 }
  });

  // 3. Cerrar modal después de 800ms
  setTimeout(() => {
    onClose();
  }, 800);
}
```

Librería: `canvas-confetti`
```bash
npm install canvas-confetti
```

#### Pagar cuota - Progress bar animation
```tsx
<motion.div
  className="progress-bar"
  initial={{ width: 0 }}
  animate={{ width: `${progreso}%` }}
  transition={{ type: 'spring', stiffness: 100, damping: 15 }}
/>
```

#### Marcar lugar visitado - Bounce checkbox
```tsx
<motion.div
  animate={visitado ? { scale: [1, 1.2, 1] } : {}}
  transition={{ duration: 0.3 }}
>
  <Checkbox checked={visitado} />
</motion.div>
```

#### Cambiar trip - Theme color morph
```tsx
// Ya implementado con data-theme, agregar transition en CSS
:root {
  transition:
    --theme-primary 0.2s ease,
    --theme-bg 0.2s ease,
    --theme-accent 0.2s ease;
}
```

#### Pull to refresh
```tsx
import PullToRefresh from 'react-simple-pull-to-refresh';

<PullToRefresh onRefresh={async () => {
  await refreshTrips();
  await refreshGastos();
}}>
  <GastosList />
</PullToRefresh>
```

### 5.3 Skeleton Loaders

Reemplazar spinners con skeleton screens para mejor perceived performance.

#### Componente genérico
```tsx
// src/components/Skeleton.tsx
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={`animate-pulse bg-gray-700/30 rounded ${className}`}
      {...props}
    />
  );
}
```

#### Skeleton de GastoCard
```tsx
function GastoCardSkeleton() {
  return (
    <div className="card">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" /> {/* Icon */}
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" /> {/* Concepto */}
          <Skeleton className="h-3 w-20" /> {/* Fecha */}
        </div>
        <Skeleton className="h-6 w-16" /> {/* Monto */}
      </div>
    </div>
  );
}
```

#### Uso en Gastos page
```tsx
{loading ? (
  <>
    <GastoCardSkeleton />
    <GastoCardSkeleton />
    <GastoCardSkeleton />
  </>
) : (
  gastos.map(gasto => <GastoCard key={gasto.id} gasto={gasto} />)
)}
```

### 5.4 Gestos Mobile

#### Swipe to delete
Librería: `react-swipeable`
```bash
npm install react-swipeable
```

```tsx
import { useSwipeable } from 'react-swipeable';

function GastoCard({ gasto, onDelete }) {
  const [swiped, setSwiped] = useState(false);

  const handlers = useSwipeable({
    onSwipedLeft: () => setSwiped(true),
    onSwipedRight: () => setSwiped(false),
    trackMouse: true
  });

  return (
    <div {...handlers} className="relative">
      <motion.div
        animate={{ x: swiped ? -80 : 0 }}
        className="card"
      >
        {/* Card content */}
      </motion.div>

      {swiped && (
        <button
          className="delete-btn"
          onClick={() => onDelete(gasto.id)}
        >
          🗑️ Eliminar
        </button>
      )}
    </div>
  );
}
```

#### Swipe down to close modal
```tsx
const [dragY, setDragY] = useState(0);

<motion.div
  drag="y"
  dragConstraints={{ top: 0, bottom: 300 }}
  dragElastic={0.2}
  onDrag={(e, info) => setDragY(info.offset.y)}
  onDragEnd={(e, info) => {
    if (info.offset.y > 150) {
      onClose(); // Cierra si drag > 150px
    }
  }}
>
  {/* Modal content */}
</motion.div>
```

#### Long press para editar
```tsx
import { useLongPress } from 'use-long-press';

const bind = useLongPress(() => {
  // Entrar en modo edición
  setEditMode(true);
}, {
  threshold: 500, // 500ms
  captureEvent: true,
});

<div {...bind()}>
  <GastoCard />
</div>
```

### 5.5 Haptic Feedback

```tsx
// src/utils/haptics.ts
export function hapticSuccess() {
  if ('vibrate' in navigator) {
    navigator.vibrate([10, 30, 10]); // Short-long-short pattern
  }
}

export function hapticWarning() {
  if ('vibrate' in navigator) {
    navigator.vibrate(50); // Single vibration
  }
}

export function hapticError() {
  if ('vibrate' in navigator) {
    navigator.vibrate([100, 50, 100]); // Double vibration
  }
}

// Uso
await deleteGasto(id);
hapticWarning();
```

### 5.6 Empty States

Diseñar estados vacíos con ilustraciones y CTAs.

```tsx
// src/components/EmptyState.tsx
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="empty-state"
    >
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 mb-6">{description}</p>
      {onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </motion.div>
  );
}

// Uso en Gastos
{gastos.length === 0 && (
  <EmptyState
    icon="🎉"
    title="Sin gastos aún"
    description="Empezá agregando tu primer gasto del viaje"
    actionLabel="Agregar gasto"
    onAction={openModal}
  />
)}
```

#### Estados vacíos por sección
- **Gastos:** 🎉 "Sin gastos aún. ¡Empezá agregando uno!"
- **Itinerario:** 📅 "Planificá tu día perfecto"
- **Documentos:** 📎 "Guardá tus reservas y tickets aquí"
- **Lugares:** 📍 "Agregá lugares para visitar"
- **Notas:** 📝 "Anotá ideas para el viaje"

### 5.7 Loading States Premium

#### Spinner custom con theme colors
```tsx
export function Spinner() {
  return (
    <motion.div
      className="spinner"
      animate={{ rotate: 360 }}
      transition={{
        repeat: Infinity,
        duration: 1,
        ease: 'linear'
      }}
    >
      <div className="spinner-ring" style={{
        borderColor: 'var(--theme-accent)',
        borderTopColor: 'transparent'
      }} />
    </motion.div>
  );
}
```

#### Button loading state
```tsx
<Button disabled={loading}>
  {loading ? (
    <>
      <Spinner className="w-4 h-4 mr-2" />
      Guardando...
    </>
  ) : (
    'Guardar'
  )}
</Button>
```

### Files to create/modify
- `src/components/animations/` - nuevos componentes
  - `PageTransition.tsx`
  - `Skeleton.tsx`
  - `EmptyState.tsx`
  - `Spinner.tsx`
- `src/utils/haptics.ts` - utilidades de vibración
- `src/utils/confetti.ts` - wrapper para confetti
- Modificar todos los pages para agregar animaciones

---

## Technical Dependencies Summary

### New packages to install
```bash
# Gráficos
npm install recharts

# PDF export
npm install jspdf jspdf-autotable

# PWA/Offline
npm install workbox-webpack-plugin dexie

# Animaciones y gestos
npm install canvas-confetti react-swipeable use-long-press react-simple-pull-to-refresh

# Optimización
npm install -D imagemin imagemin-pngquant
```

### Existing packages used
- `framer-motion` ✅ (ya instalado)
- `@supabase/supabase-js` ✅
- `react`, `react-router-dom` ✅

---

## Success Metrics

### Funcionalidad
- ✅ Fechas de trips editables desde Config
- ✅ Dólar blue auto-actualizado (< 6hs de latencia)
- ✅ Gráficos muestran distribución de gastos
- ✅ PDF exportable con todos los datos
- ✅ App funciona 100% offline

### Performance
- Lighthouse Performance Score > 90
- Time to Interactive < 2s
- Bundle size < 500KB (gzipped)
- Offline functionality probada en modo avión

### UX
- Transiciones fluidas (60fps)
- Feedback inmediato en todas las acciones
- Estados vacíos ilustrados
- Skeleton loaders en vez de spinners
- Gestos mobile intuitivos

---

## Implementation Notes

### Orden sugerido dentro de cada fase
1. **Fechas:** Config page → validación → Supabase update
2. **Dólar:** Hook → API integration → caché → auto-refresh
3. **Features:** Gráficos básicos → PDF básico → polish
4. **PWA:** Service Worker → IndexedDB → sync queue → optimización
5. **UX:** Animaciones core → gestos → empty states → haptics

### Testing checklist
- [ ] Editar fechas y verificar persistencia
- [ ] Auto-update dólar blue funciona
- [ ] Gráficos renderizan correctamente
- [ ] PDF se genera y descarga
- [ ] Agregar gasto offline → sync al volver online
- [ ] Todas las animaciones a 60fps
- [ ] Gestos funcionan en iOS y Android
- [ ] Lighthouse score >90

### Git strategy
- Feature branches por cada sección
- `feat/editable-dates`
- `feat/dolar-automation`
- `feat/charts-pdf`
- `feat/pwa-offline`
- `feat/ux-polish`

Merge a `master` después de cada fase completada y probada.

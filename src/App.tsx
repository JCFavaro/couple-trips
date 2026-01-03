import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { TripProvider, useTrip } from './contexts';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/layout';
import { Home, Gastos, ItinerarioPage, Config, TripSelector, TripWelcome } from './pages';
import { Login } from './pages/Login';

// Component that requires a trip to be selected
function TripRequired({ children }: { children: React.ReactNode }) {
  const { currentTrip, loading } = useTrip();

  if (loading) {
    return null; // TripSelector shows its own loading
  }

  if (!currentTrip) {
    return <Navigate to="/trips" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />

      {/* Trip selector (protected but no trip required) */}
      <Route
        path="/trips"
        element={
          <ProtectedRoute>
            <TripSelector />
          </ProtectedRoute>
        }
      />

      {/* Trip welcome screen */}
      <Route
        path="/welcome"
        element={
          <ProtectedRoute>
            <TripRequired>
              <TripWelcome />
            </TripRequired>
          </ProtectedRoute>
        }
      />

      {/* Protected routes that require a trip */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <TripRequired>
              <Layout />
            </TripRequired>
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="gastos" element={<Gastos />} />
        <Route path="itinerario" element={<ItinerarioPage />} />
        <Route path="config" element={<Config />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <TripProvider>
          <AppRoutes />
        </TripProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

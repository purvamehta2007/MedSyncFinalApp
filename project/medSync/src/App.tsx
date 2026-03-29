import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth-context';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardHome } from './pages/DashboardHome';
import { MedicinesPage } from './pages/MedicinesPage';
import { RemindersPage } from './pages/RemindersPage';
import { IntakesPage } from './pages/IntakesPage';
import { HealthRecordPage } from './pages/HealthRecordPage';
import { ContactsPage } from './pages/ContactsPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { IntelligencePage } from './pages/IntelligencePage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="medicines" element={<MedicinesPage />} />
        <Route path="reminders" element={<RemindersPage />} />
        <Route path="intakes" element={<IntakesPage />} />
        <Route path="health" element={<HealthRecordPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="emergency" element={<EmergencyPage />} />
        <Route path="intelligence" element={<IntelligencePage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

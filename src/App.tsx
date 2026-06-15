import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import LoanApplication from './components/LoanApplication';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthProvider';
import LandingPageGuard from './components/LandingPageGuard';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* Protected landing page – wrapped behind Keycloak redirect login */}
        <Route
          path="/"
          element={
            <LandingPageGuard>
              <Login />
            </LandingPageGuard>
          }
        />

        {/* Protected area – Keycloak is initialised only when the user
            navigates here (i.e. after clicking a button on the landing page) */}
        <Route
          path="/dashboard"
          element={
            <AuthProvider>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </AuthProvider>
          }
        />
        <Route
          path="/kreditantrag"
          element={
            <AuthProvider>
              <ProtectedRoute>
                <LoanApplication />
              </ProtectedRoute>
            </AuthProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

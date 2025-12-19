import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import DossierListPage from './pages/DossierListPage'
import DossierEditPage from './pages/DossierEditPage'
import CreateDossierPage from './pages/CreateDossierPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="dossiers" element={<DossierListPage />} />
        <Route path="dossiers/new" element={<CreateDossierPage />} />
        <Route path="dossiers/:dossierId" element={<DossierEditPage />} />
      </Route>
    </Routes>
  )
}

export default App

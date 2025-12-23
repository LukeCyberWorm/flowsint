import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DossierViewPage from './pages/DossierViewPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import TokenEntryPage from './pages/TokenEntryPage'
import RSLSearchPage from './pages/RSLSearchPage'

function App() {
  const hostname = window.location.hostname
  const isAdmin = hostname.includes('adm-dossie') || hostname.includes('localhost') // Allow localhost for testing

  return (
    <Routes>
      {isAdmin ? (
        <>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/rsl-search" element={<RSLSearchPage />} />
          {/* Fallback for admin routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          <Route path="/dossier/:accessToken" element={<DossierViewPage />} />
          <Route path="/" element={<TokenEntryPage />} />
          {/* Fallback for client routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  )
}

export default App

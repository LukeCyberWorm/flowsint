import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DossierViewPage from './pages/DossierViewPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dossier/:accessToken" element={<DossierViewPage />} />
    </Routes>
  )
}

export default App

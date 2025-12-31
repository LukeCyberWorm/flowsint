// src/routes/register.tsx
// REGISTRO DESABILITADO - Acesso apenas para contas autorizadas
import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/register')({
  component: RegisterDisabled
})

function RegisterDisabled() {
  // Redirecionar para login
  return <Navigate to="/login" replace />
}

export default RegisterDisabled

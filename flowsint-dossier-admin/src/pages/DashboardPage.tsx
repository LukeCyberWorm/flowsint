import { useQuery } from '@tanstack/react-query'
import { FileText, Users, Clock, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { dossierApi, Dossier } from '../api/dossier'

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dossiers-stats'],
    queryFn: () => dossierApi.listDossiers({ limit: 100 }),
  })

  const dossiers = data?.items || []
  const stats = {
    total: dossiers.length,
    active: dossiers.filter((d) => d.status === 'active').length,
    draft: dossiers.filter((d) => d.status === 'draft').length,
    closed: dossiers.filter((d) => d.status === 'closed').length,
  }

  const recentDossiers = dossiers.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral dos dossiês</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total de Dossiês</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Ativos</p>
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Rascunhos</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.draft}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Fechados</p>
              <p className="text-3xl font-bold text-gray-600">{stats.closed}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <Users className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Dossiers */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Dossiês Recentes</h2>
            <Link
              to="/dossiers"
              className="text-sm text-scarlet-600 hover:text-scarlet-700 font-medium"
            >
              Ver todos →
            </Link>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Carregando...</div>
          ) : recentDossiers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Nenhum dossiê encontrado
            </div>
          ) : (
            recentDossiers.map((dossier) => (
              <Link
                key={dossier.id}
                to={`/dossiers/${dossier.id}`}
                className="p-6 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{dossier.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Caso #{dossier.case_number} • {dossier.client_name || 'Sem cliente'}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      dossier.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : dossier.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {dossier.status === 'active'
                      ? 'Ativo'
                      : dossier.status === 'draft'
                      ? 'Rascunho'
                      : 'Fechado'}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

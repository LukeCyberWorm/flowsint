import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, Plus, Filter, FileText } from 'lucide-react'
import { dossierApi } from '../api/dossier'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function DossierListPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const { data, isLoading } = useQuery({
    queryKey: ['dossiers', search, statusFilter],
    queryFn: () =>
      dossierApi.listDossiers({
        q: search || undefined,
        status: statusFilter || undefined,
        limit: 50,
      }),
  })

  const dossiers = data?.items || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dossiês</h1>
          <p className="text-gray-600 mt-1">Gerencie todos os dossiês de casos</p>
        </div>
        <Link
          to="/dossiers/new"
          className="flex items-center space-x-2 bg-scarlet-600 text-white px-4 py-2 rounded-lg hover:bg-scarlet-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Dossiê</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar dossiês..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scarlet-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scarlet-500 focus:border-transparent outline-none appearance-none"
            >
              <option value="">Todos os status</option>
              <option value="draft">Rascunho</option>
              <option value="active">Ativo</option>
              <option value="archived">Arquivado</option>
              <option value="closed">Fechado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dossiers List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : dossiers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Nenhum dossiê encontrado</p>
            <p className="text-sm">Crie um novo dossiê para começar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Caso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Arquivos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dossiers.map((dossier) => (
                  <tr key={dossier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{dossier.title}</p>
                        <p className="text-sm text-gray-500">#{dossier.case_number}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {dossier.client_name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          dossier.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : dossier.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : dossier.status === 'archived'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {dossier.status === 'active'
                          ? 'Ativo'
                          : dossier.status === 'draft'
                          ? 'Rascunho'
                          : dossier.status === 'archived'
                          ? 'Arquivado'
                          : 'Fechado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {dossier.file_count || 0} arquivo(s)
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(dossier.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/dossiers/${dossier.id}`}
                        className="text-scarlet-600 hover:text-scarlet-700 font-medium text-sm"
                      >
                        Editar →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

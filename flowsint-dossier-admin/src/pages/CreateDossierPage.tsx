import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft, Save } from 'lucide-react'
import { dossierApi } from '../api/dossier'

export default function CreateDossierPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    investigation_id: '',
    case_number: '',
    title: '',
    description: '',
    client_name: '',
    client_email: '',
    is_public: false,
    access_password: '',
  })

  // Fetch investigations for dropdown
  const { data: investigations = [] } = useQuery({
    queryKey: ['investigations'],
    queryFn: () => dossierApi.listInvestigations(),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => dossierApi.createDossier(data),
    onSuccess: (data) => {
      toast.success('Dossiê criado com sucesso!')
      navigate(`/dossiers/${data.id}`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao criar dossiê')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Novo Dossiê</h1>
          <p className="text-gray-600 mt-1">Crie um novo dossiê de caso</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-6">
          {/* Investigation Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investigação *
            </label>
            <select
              value={formData.investigation_id}
              onChange={(e) =>
                setFormData({ ...formData, investigation_id: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scarlet-500 focus:border-transparent outline-none"
              required
            >
              <option value="">Selecione uma investigação</option>
              {investigations.map((inv: any) => (
                <option key={inv.id} value={inv.id}>
                  {inv.name || inv.title || inv.id}
                </option>
              ))}
            </select>
          </div>

          {/* Case Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número do Caso *
            </label>
            <input
              type="text"
              value={formData.case_number}
              onChange={(e) =>
                setFormData({ ...formData, case_number: e.target.value })
              }
              placeholder="Ex: 2025-001"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scarlet-500 focus:border-transparent outline-none"
              required
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Título do dossiê"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scarlet-500 focus:border-transparent outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Descrição detalhada do caso..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scarlet-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Cliente
            </label>
            <input
              type="text"
              value={formData.client_name}
              onChange={(e) =>
                setFormData({ ...formData, client_name: e.target.value })
              }
              placeholder="Nome do cliente"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scarlet-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Client Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email do Cliente
            </label>
            <input
              type="email"
              value={formData.client_email}
              onChange={(e) =>
                setFormData({ ...formData, client_email: e.target.value })
              }
              placeholder="cliente@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scarlet-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Public Access */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_public"
              checked={formData.is_public}
              onChange={(e) =>
                setFormData({ ...formData, is_public: e.target.checked })
              }
              className="w-4 h-4 text-scarlet-600 border-gray-300 rounded focus:ring-scarlet-500"
            />
            <label htmlFor="is_public" className="text-sm font-medium text-gray-700">
              Tornar público para o cliente
            </label>
          </div>

          {/* Access Password */}
          {formData.is_public && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha de Acesso (opcional)
              </label>
              <input
                type="password"
                value={formData.access_password}
                onChange={(e) =>
                  setFormData({ ...formData, access_password: e.target.value })
                }
                placeholder="Senha para proteger o acesso"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scarlet-500 focus:border-transparent outline-none"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center space-x-2 px-4 py-2 bg-scarlet-600 text-white rounded-lg hover:bg-scarlet-700 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{createMutation.isPending ? 'Salvando...' : 'Criar Dossiê'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

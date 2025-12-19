import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Copy, ExternalLink, Upload, Trash2, FileText } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { dossierApi } from '../api/dossier'

export default function DossierEditPage() {
  const { dossierId } = useParams<{ dossierId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'info' | 'files' | 'notes'>('info')

  // Fetch dossier
  const { data: dossier, isLoading } = useQuery({
    queryKey: ['dossier', dossierId],
    queryFn: () => dossierApi.getDossier(dossierId!),
    enabled: !!dossierId,
  })

  // Fetch files
  const { data: files = [] } = useQuery({
    queryKey: ['dossier-files', dossierId],
    queryFn: () => dossierApi.listFiles(dossierId!),
    enabled: !!dossierId,
  })

  // Fetch notes
  const { data: notes = [] } = useQuery({
    queryKey: ['dossier-notes', dossierId],
    queryFn: () => dossierApi.listNotes(dossierId!),
    enabled: !!dossierId,
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => dossierApi.updateDossier(dossierId!, data),
    onSuccess: () => {
      toast.success('Dossiê atualizado!')
      queryClient.invalidateQueries({ queryKey: ['dossier', dossierId] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao atualizar')
    },
  })

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => dossierApi.uploadFile(dossierId!, file),
    onSuccess: () => {
      toast.success('Arquivo enviado!')
      queryClient.invalidateQueries({ queryKey: ['dossier-files', dossierId] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao enviar arquivo')
    },
  })

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: (fileId: string) => dossierApi.deleteFile(dossierId!, fileId),
    onSuccess: () => {
      toast.success('Arquivo removido!')
      queryClient.invalidateQueries({ queryKey: ['dossier-files', dossierId] })
    },
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      acceptedFiles.forEach((file) => uploadMutation.mutate(file))
    },
  })

  const copyAccessLink = () => {
    const link = `https://dossie.scarletredsolutions.com/dossier/${dossier?.access_token}`
    navigator.clipboard.writeText(link)
    toast.success('Link copiado!')
  }

  if (isLoading || !dossier) {
    return <div className="p-8 text-center">Carregando...</div>
  }

  const clientUrl = `https://dossie.scarletredsolutions.com/dossier/${dossier.access_token}`

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{dossier.title}</h1>
            <p className="text-gray-600 mt-1">Caso #{dossier.case_number}</p>
          </div>
        </div>
        
        {dossier.is_public && (
          <div className="flex items-center space-x-2">
            <button
              onClick={copyAccessLink}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <Copy className="w-4 h-4" />
              <span>Copiar Link</span>
            </button>
            <a
              href={clientUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-scarlet-600 text-white rounded-lg hover:bg-scarlet-700 transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir</span>
            </a>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'info', label: 'Informações' },
              { id: 'files', label: `Arquivos (${files.length})` },
              { id: 'notes', label: `Notas (${notes.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'border-b-2 border-scarlet-600 text-scarlet-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={dossier.status}
                    onChange={(e) =>
                      updateMutation.mutate({ status: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scarlet-500 outline-none"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="active">Ativo</option>
                    <option value="archived">Arquivado</option>
                    <option value="closed">Fechado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Público
                  </label>
                  <div className="flex items-center space-x-3 h-10">
                    <input
                      type="checkbox"
                      checked={dossier.is_public}
                      onChange={(e) =>
                        updateMutation.mutate({ is_public: e.target.checked })
                      }
                      className="w-4 h-4 text-scarlet-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      {dossier.is_public ? 'Sim' : 'Não'}
                    </span>
                  </div>
                </div>
              </div>

              {dossier.is_public && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Link de Acesso do Cliente
                  </p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={clientUrl}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded text-sm"
                    />
                    <button
                      onClick={copyAccessLink}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="font-medium">{dossier.client_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{dossier.client_email || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div className="space-y-4">
              {/* Upload Area */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                  isDragActive
                    ? 'border-scarlet-500 bg-scarlet-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {isDragActive
                    ? 'Solte os arquivos aqui...'
                    : 'Arraste arquivos ou clique para selecionar'}
                </p>
              </div>

              {/* Files List */}
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {file.original_filename}
                        </p>
                        <p className="text-sm text-gray-500">
                          {file.file_size
                            ? `${(file.file_size / 1024).toFixed(2)} KB`
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteFileMutation.mutate(file.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {notes.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhuma nota ainda</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="p-4 bg-gray-50 rounded-lg">
                    {note.title && (
                      <h3 className="font-semibold text-gray-900 mb-2">{note.title}</h3>
                    )}
                    <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                    {note.is_internal && (
                      <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                        Interna
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

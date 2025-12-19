import { useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Download,
  Calendar,
  Tag,
  Image as ImageIcon,
  File,
  Video,
  Music,
  ChevronDown,
  ChevronUp,
  Pin,
  LogOut,
  Loader,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'
import { dossierApi, Dossier, DossierFile, DossierNote } from '../api/dossier'

export default function DossierViewPage() {
  const { accessToken } = useParams<{ accessToken: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const password = searchParams.get('password') || undefined

  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'notes'>('overview')
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())

  // Fetch dossier data
  const {
    data: dossier,
    isLoading: dossierLoading,
    error: dossierError,
  } = useQuery<Dossier>({
    queryKey: ['dossier', accessToken],
    queryFn: () => dossierApi.accessDossier(accessToken!, password),
    enabled: !!accessToken,
  })

  // Fetch files
  const { data: files = [], isLoading: filesLoading } = useQuery<DossierFile[]>({
    queryKey: ['dossier-files', accessToken],
    queryFn: () => dossierApi.getFiles(accessToken!),
    enabled: !!accessToken && !!dossier,
  })

  // Fetch notes
  const { data: notes = [], isLoading: notesLoading } = useQuery<DossierNote[]>({
    queryKey: ['dossier-notes', accessToken],
    queryFn: () => dossierApi.getNotes(accessToken!),
    enabled: !!accessToken && !!dossier,
  })

  const handleLogout = () => {
    navigate('/login')
  }

  const toggleNote = (noteId: string) => {
    setExpandedNotes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(noteId)) {
        newSet.delete(noteId)
      } else {
        newSet.add(noteId)
      }
      return newSet
    })
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <ImageIcon className="w-8 h-8" />
      case 'video':
        return <Video className="w-8 h-8" />
      case 'audio':
        return <Music className="w-8 h-8" />
      default:
        return <File className="w-8 h-8" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      case 'archived':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'closed':
        return 'Fechado'
      case 'archived':
        return 'Arquivado'
      case 'draft':
        return 'Rascunho'
      default:
        return status
    }
  }

  if (dossierLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--background)]">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[color:var(--primary)] animate-spin mx-auto mb-4" />
          <p className="text-[color:var(--foreground)] text-lg">Carregando dossiê...</p>
        </div>
      </div>
    )
  }

  if (dossierError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[color:var(--background)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[color:var(--card)] rounded-lg shadow-xl p-8 max-w-md w-full text-center border border-[color:var(--border)]"
        >
          <div className="text-[color:var(--destructive)] text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-[color:var(--card-foreground)] mb-2">Acesso Negado</h2>
          <p className="text-[color:var(--muted-foreground)] mb-6">
            Não foi possível acessar este dossiê. Verifique seu token de acesso e senha.
          </p>
          <button
            onClick={handleLogout}
            className="bg-[color:var(--primary)] text-[color:var(--primary-foreground)] px-6 py-2 rounded-lg hover:opacity-90 transition"
          >
            Voltar ao Login
          </button>
        </motion.div>
      </div>
    )
  }

  if (!dossier) return null

  return (
    <div className="min-h-screen pb-8 bg-[color:var(--background)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[color:var(--card)] shadow-lg border-b border-[color:var(--border)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-[color:var(--primary)]/10 p-3 rounded-lg">
                <FileText className="w-8 h-8 text-[color:var(--primary)]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[color:var(--card-foreground)]">{dossier.title}</h1>
                <p className="text-sm text-[color:var(--muted-foreground)]">Caso #{dossier.case_number}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                  dossier.status
                )}`}
              >
                {getStatusLabel(dossier.status)}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-[color:var(--card)] rounded-lg shadow-lg overflow-hidden border border-[color:var(--border)]">
          <div className="border-b border-[color:var(--border)]">
            <nav className="flex -mb-px">
              {[
                { id: 'overview', label: 'Visão Geral' },
                { id: 'files', label: `Arquivos (${files.length})` },
                { id: 'notes', label: `Notas (${notes.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-4 text-sm font-medium transition ${
                    activeTab === tab.id
                      ? 'border-b-2 border-[color:var(--primary)] text-[color:var(--primary)]'
                      : 'text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] hover:border-[color:var(--border)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Description */}
                  {dossier.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-[color:var(--card-foreground)] mb-3">
                        Descrição do Caso
                      </h3>
                      <div className="prose max-w-none text-[color:var(--foreground)]">
                        <ReactMarkdown>{dossier.description}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dossier.client_name && (
                      <div className="bg-[color:var(--muted)] rounded-lg p-4 border border-[color:var(--border)]">
                        <p className="text-sm text-[color:var(--muted-foreground)] mb-1">Cliente</p>
                        <p className="font-semibold text-[color:var(--card-foreground)]">{dossier.client_name}</p>
                      </div>
                    )}
                    <div className="bg-[color:var(--muted)] rounded-lg p-4 border border-[color:var(--border)]">
                      <p className="text-sm text-[color:var(--muted-foreground)] mb-1">Data de Criação</p>
                      <p className="font-semibold text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {format(new Date(dossier.created_at), 'PPP', { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  {dossier.tags && dossier.tags.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Tag className="w-5 h-5 mr-2" />
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {dossier.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-scarlet-100 text-scarlet-800 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <File className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-900">{files.length}</p>
                      <p className="text-sm text-blue-700">Arquivos</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-900">{notes.length}</p>
                      <p className="text-sm text-green-700">Notas</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <ImageIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-900">
                        {files.filter((f) => f.file_type === 'image').length}
                      </p>
                      <p className="text-sm text-purple-700">Imagens</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Files Tab */}
              {activeTab === 'files' && (
                <motion.div
                  key="files"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  {filesLoading ? (
                    <div className="text-center py-12">
                      <Loader className="w-8 h-8 text-scarlet-600 animate-spin mx-auto" />
                    </div>
                  ) : files.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <File className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Nenhum arquivo disponível</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {files.map((file) => (
                        <motion.div
                          key={file.id}
                          whileHover={{ scale: 1.02 }}
                          className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                          onClick={() => {
                            window.open(
                              dossierApi.downloadFile(file.dossier_id, file.id),
                              '_blank'
                            )
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="text-scarlet-600">{getFileIcon(file.file_type)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {file.original_filename}
                              </p>
                              {file.description && (
                                <p className="text-sm text-gray-500 mt-1">{file.description}</p>
                              )}
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-400">
                                  {file.file_size
                                    ? `${(file.file_size / 1024).toFixed(2)} KB`
                                    : 'N/A'}
                                </span>
                                <Download className="w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <motion.div
                  key="notes"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {notesLoading ? (
                    <div className="text-center py-12">
                      <Loader className="w-8 h-8 text-scarlet-600 animate-spin mx-auto" />
                    </div>
                  ) : notes.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma nota disponível</p>
                    </div>
                  ) : (
                    notes.map((note) => {
                      const isExpanded = expandedNotes.has(note.id)
                      return (
                        <motion.div
                          key={note.id}
                          layout
                          className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition"
                        >
                          <div
                            className="flex items-start justify-between cursor-pointer"
                            onClick={() => toggleNote(note.id)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                {note.is_pinned && (
                                  <Pin className="w-4 h-4 text-scarlet-600" />
                                )}
                                {note.title && (
                                  <h4 className="font-semibold text-gray-900">{note.title}</h4>
                                )}
                              </div>
                              <div
                                className={`prose max-w-none text-gray-700 ${
                                  !isExpanded ? 'line-clamp-3' : ''
                                }`}
                              >
                                <ReactMarkdown>{note.content}</ReactMarkdown>
                              </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 ml-4">
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {note.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="bg-white text-gray-600 px-2 py-1 rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

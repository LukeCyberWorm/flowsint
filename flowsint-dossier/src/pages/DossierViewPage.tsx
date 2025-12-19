import { useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Download,
  Image as ImageIcon,
  Video,
  Music,
  MapPin,
  Building2,
  Users,
  Shield,
  AlertTriangle,
  Clock,
  Target,
  LogOut,
  Loader,
  ChevronRight,
  Pin,
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

  const [selectedSection, setSelectedSection] = useState<string>('overview')
  const [activeSubject, setActiveSubject] = useState<'pedro' | 'afonso'>('pedro')

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
  const { data: notes = [] } = useQuery<DossierNote[]>({
    queryKey: ['dossier-notes', accessToken],
    queryFn: () => dossierApi.getNotes(accessToken!),
    enabled: !!accessToken && !!dossier,
  })

  const handleLogout = () => {
    navigate('/login')
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <ImageIcon className="w-5 h-5" />
      case 'video':
        return <Video className="w-5 h-5" />
      case 'audio':
        return <Music className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getSubject = (content: string = '', filename: string = '') => {
    const text = (content + filename).toLowerCase()
    
    // Explicit checks for Afonso
    if (text.includes('afonso henrique') || 
        text.includes('afonso lagoeiro') || 
        text.includes('pai provável') ||
        filename.includes('afonso')) {
      return 'afonso'
    }
    
    // Explicit checks for Pedro
    if (text.includes('pedro henrique') || 
        text.includes('pedro ferreira') || 
        filename.includes('pedro')) {
      return 'pedro'
    }

    // Default fallback based on context
    if (text.includes('afonso') && !text.includes('pedro')) return 'afonso'
    
    return 'pedro'
  }

  const filteredNotes = notes.filter(note => getSubject(note.content) === activeSubject)
  const filteredFiles = files.filter(file => getSubject('', file.file_name) === activeSubject)
  const pinnedNotes = filteredNotes.filter((note) => note.is_pinned)
  const regularNotes = filteredNotes.filter((note) => !note.is_pinned)

  const profileImage = files.find(
    (f) => f.file_type === 'image' && 
           f.file_name && 
           (f.file_name.toLowerCase().includes('perfil') || f.file_name.toLowerCase().includes('profile')) &&
           getSubject('', f.file_name) === activeSubject
  )

  const subjectName = activeSubject === 'pedro' ? 'Pedro Henrique Ferreira Dutra' : 'Afonso Henrique Lagoeiro Dutra'

  if (dossierLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader className="w-12 h-12 text-[#d72638] animate-spin" />
      </div>
    )
  }

  if (dossierError || !dossier) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Acesso Negado</h1>
          <p className="text-gray-400">Não foi possível acessar este dossiê.</p>
          <button
            onClick={handleLogout}
            className="mt-6 px-6 py-2 bg-[#d72638] text-white rounded-lg hover:bg-[#b91f2f] transition"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="bg-[#111] border-b-2 border-[#d72638] sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-[#d72638]" />
              <div>
                <h1 className="text-2xl font-bold text-white">SCARLET RED SOLUTIONS</h1>
                <p className="text-sm text-gray-400">Technical Dossier</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Case</p>
                <p className="font-mono font-bold text-[#d72638]">{dossier.case_number}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-[#1a1a1a] rounded-lg transition"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Subject Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-[#111] p-1 rounded-lg border border-[#222] inline-flex">
            <button
              onClick={() => setActiveSubject('pedro')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeSubject === 'pedro'
                  ? 'bg-[#d72638] text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-[#222]'
              }`}
            >
              Pedro Henrique
            </button>
            <button
              onClick={() => setActiveSubject('afonso')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeSubject === 'afonso'
                  ? 'bg-[#d72638] text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-[#222]'
              }`}
            >
              Afonso Henrique
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#111] rounded-xl p-6 border border-[#222] sticky top-24"
            >
              {/* Profile Image */}
              <div className="mb-6">
                {profileImage ? (
                  <img
                    src={profileImage.file_url}
                    alt="Profile"
                    className="w-48 h-48 rounded-full mx-auto object-cover border-4 border-[#d72638]"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-full mx-auto bg-[#222] flex items-center justify-center border-4 border-[#d72638]">
                    <Target className="w-24 h-24 text-gray-600" />
                  </div>
                )}
              </div>

              {/* Target Name */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-1">{subjectName}</h2>
                {dossier.client_name && (
                  <p className="text-sm text-gray-400">{dossier.client_name}</p>
                )}
              </div>

              {/* Quick Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-[#222]">
                  <span className="text-sm text-gray-400">Case Number</span>
                  <span className="font-mono text-[#d72638]">{dossier.case_number}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#222]">
                  <span className="text-sm text-gray-400">Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      dossier.status === 'active'
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-gray-900/30 text-gray-400'
                    }`}
                  >
                    {dossier.status?.toUpperCase()}
                  </span>
                </div>
                {dossier.created_at && (
                  <div className="flex justify-between items-center py-2 border-b border-[#222]">
                    <span className="text-sm text-gray-400">Created</span>
                    <span className="text-sm">
                      {format(new Date(dossier.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-400">Accuracy</span>
                  <span className="text-lg font-bold text-green-400">99.5%</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedSection('overview')}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition flex items-center justify-between ${
                    selectedSection === 'overview'
                      ? 'bg-[#d72638] text-white'
                      : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#222]'
                  }`}
                >
                  <span>Overview</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedSection('analysis')}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition flex items-center justify-between ${
                    selectedSection === 'analysis'
                      ? 'bg-[#d72638] text-white'
                      : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#222]'
                  }`}
                >
                  <span>General Analysis</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedSection('documents')}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition flex items-center justify-between ${
                    selectedSection === 'documents'
                      ? 'bg-[#d72638] text-white'
                      : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#222]'
                  }`}
                >
                  <span>Documents</span>
                  <span className="text-xs bg-[#d72638] px-2 py-1 rounded-full">{filteredFiles.length}</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Overview Section */}
              {selectedSection === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Description - Only show for Pedro as it is the main case description */}
                  {dossier.description && activeSubject === 'pedro' && (
                    <div className="bg-[#111] rounded-xl p-6 border border-[#222]">
                      <h3 className="text-xl font-bold mb-4 text-[#d72638]">Case Description</h3>
                      <div className="prose prose-invert max-w-none">
                        <ReactMarkdown>{dossier.description}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {/* Pinned Notes */}
                  {pinnedNotes.length > 0 && (
                    <div className="space-y-4">
                      {pinnedNotes.map((note) => (
                        <div
                          key={note.id}
                          className="bg-[#111] rounded-xl p-6 border border-[#d72638] relative"
                        >
                          <Pin className="absolute top-4 right-4 w-5 h-5 text-[#d72638]" />
                          <div className="prose prose-invert max-w-none">
                            <ReactMarkdown>{note.content}</ReactMarkdown>
                          </div>
                          {note.created_at && (
                            <div className="mt-4 pt-4 border-t border-[#222] flex items-center gap-2 text-sm text-gray-400">
                              <Clock className="w-4 h-4" />
                              {format(new Date(note.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                                locale: ptBR,
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Regular Notes */}
                  {regularNotes.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-[#d72638]">Additional Notes</h3>
                      {regularNotes.map((note) => (
                        <div key={note.id} className="bg-[#111] rounded-xl p-6 border border-[#222]">
                          <div className="prose prose-invert max-w-none">
                            <ReactMarkdown>{note.content}</ReactMarkdown>
                          </div>
                          {note.created_at && (
                            <div className="mt-4 pt-4 border-t border-[#222] flex items-center gap-2 text-sm text-gray-400">
                              <Clock className="w-4 h-4" />
                              {format(new Date(note.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                                locale: ptBR,
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Analysis Section */}
              {selectedSection === 'analysis' && (
                <motion.div
                  key="analysis"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-[#111] rounded-xl p-6 border border-[#222]"
                >
                  <h3 className="text-xl font-bold mb-6 text-[#d72638]">General Analysis</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-[#1a1a1a] rounded-lg">
                      <MapPin className="w-6 h-6 text-[#d72638] flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">Geolocalização Principal</h4>
                        <p className="text-sm text-gray-400">
                          Goiânia-GO, Flores de Goiás-GO, Naviraí-MS
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-[#1a1a1a] rounded-lg">
                      <Building2 className="w-6 h-6 text-[#d72638] flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">Empresas Vinculadas</h4>
                        <p className="text-sm text-gray-400">Agro Dutra Participações | P & L Intermediações</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-[#1a1a1a] rounded-lg">
                      <Target className="w-6 h-6 text-[#d72638] flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">Facial Match</h4>
                        <p className="text-sm text-gray-400">99.5% accuracy | Scarlet-IA</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-[#1a1a1a] rounded-lg">
                      <Users className="w-6 h-6 text-[#d72638] flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">Núcleo Familiar</h4>
                        <p className="text-sm text-gray-400">6 membros mapeados | Relacionamentos confirmados</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Documents Section */}
              {selectedSection === 'documents' && (
                <motion.div
                  key="documents"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-[#111] rounded-xl p-6 border border-[#222]"
                >
                  <h3 className="text-xl font-bold mb-6 text-[#d72638]">Associated Documents</h3>
                  {filesLoading ? (
                    <div className="text-center py-12">
                      <Loader className="w-8 h-8 text-[#d72638] animate-spin mx-auto" />
                    </div>
                  ) : filteredFiles.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>Nenhum documento disponível</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#222]">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Type</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Name</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Date</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Size</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredFiles.map((file) => (
                            <tr
                              key={file.id}
                              className="border-b border-[#222] hover:bg-[#1a1a1a] transition"
                            >
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2 text-[#d72638]">
                                  {getFileIcon(file.file_type || 'other')}
                                  <span className="text-xs font-mono uppercase">
                                    {file.file_type || 'other'}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <p className="font-medium">{file.file_name}</p>
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-400">
                                {file.uploaded_at &&
                                  format(new Date(file.uploaded_at), 'dd-MM-yyyy', { locale: ptBR })}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-400">
                                {file.file_size ? formatFileSize(file.file_size) : '-'}
                              </td>
                              <td className="py-4 px-4 text-right">
                                <a
                                  href={file.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#d72638] hover:bg-[#b91f2f] rounded-lg text-sm font-medium transition"
                                >
                                  <Download className="w-4 h-4" />
                                  View
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#111] border-t-2 border-[#d72638] mt-12">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Equipe Responsável:</p>
            <p className="text-white font-medium">Lucas Oliveira - CEO & Perito Forense Digital</p>
            <p className="text-white font-medium">Rafael Martin Carreno de Paula Souza - Advogado (OAB/SP 354.241)</p>
            <p className="text-gray-400 text-sm mt-4">
              © 2025 Scarlet Red Solutions - Todos os direitos reservados
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

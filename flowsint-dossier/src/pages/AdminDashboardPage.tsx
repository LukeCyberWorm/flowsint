import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, FileText, Shield, Plus, Upload, Save } from 'lucide-react'
import { dossierApi, Dossier } from '../api/dossier'
import { format } from 'date-fns'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dossiers')
  const [dossiers, setDossiers] = useState<Dossier[]>([])
  const [selectedDossier, setSelectedDossier] = useState<Dossier | null>(null)
  
  // Form States
  const [newNoteContent, setNewNoteContent] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [uploading, setUploading] = useState(false)

  const token = localStorage.getItem('admin_token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    fetchDossiers()
  }, [token])

  const fetchDossiers = async () => {
    try {
      const data = await dossierApi.getAllDossiers(token!)
      setDossiers(data)
    } catch (error) {
      console.error('Error fetching dossiers:', error)
    }
  }

  const handleSelectDossier = async (dossier: Dossier) => {
    setSelectedDossier(dossier)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    navigate('/login')
  }

  const handleAddSuspect = () => {
    setNewNoteContent(prev => prev + "\n\n## Novo Suspeito\n**Nome:** \n**CPF:** \n**Relação:** \n")
  }

  const handleSaveNote = async () => {
    if (!selectedDossier || !newNoteContent) return
    try {
      await dossierApi.createNote(token!, selectedDossier.id, newNoteContent, isPinned)
      setNewNoteContent('')
      alert('Nota adicionada com sucesso!')
    } catch (error) {
      alert('Erro ao salvar nota')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedDossier || !e.target.files?.[0]) return
    try {
      setUploading(true)
      await dossierApi.uploadFile(token!, selectedDossier.id, e.target.files[0])
      alert('Arquivo enviado com sucesso!')
    } catch (error) {
      alert('Erro ao enviar arquivo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111] text-white flex-shrink-0 fixed h-full">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#d72638]" />
            <div>
              <h1 className="font-bold text-lg">Scarlet Admin</h1>
              <p className="text-xs text-gray-400">Painel de Controle</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => { setActiveTab('dossiers'); setSelectedDossier(null) }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              activeTab === 'dossiers' ? 'bg-[#d72638] text-white' : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Dossiês</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-gray-400 hover:bg-gray-800 mt-auto absolute bottom-4 w-[calc(100%-2rem)]"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 ml-64">
        {!selectedDossier ? (
          // List View
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Gerenciar Dossiês</h2>
              <button className="bg-[#d72638] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#b91f2f]">
                <Plus className="w-4 h-4" /> Novo Caso
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-600">Caso</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Cliente</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Data</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dossiers.map((dossier) => (
                    <tr key={dossier.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{dossier.case_number}</td>
                      <td className="px-6 py-4 text-gray-600">{dossier.client_name || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          {dossier.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {format(new Date(dossier.created_at), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleSelectDossier(dossier)}
                          className="text-[#d72638] hover:underline font-medium"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Detail/Edit View
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => setSelectedDossier(null)}
                className="text-gray-500 hover:text-gray-800"
              >
                &larr; Voltar
              </button>
              <h2 className="text-2xl font-bold text-gray-800">
                Editando: {selectedDossier.case_number}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add Note Section */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#d72638]" />
                  Adicionar Nota / Suspeito
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={handleAddSuspect}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium text-gray-700"
                    >
                      + Template Suspeito
                    </button>
                  </div>
                  <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d72638] focus:border-transparent"
                    placeholder="Digite o conteúdo da nota (Markdown suportado)..."
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-gray-600">
                      <input 
                        type="checkbox" 
                        checked={isPinned}
                        onChange={(e) => setIsPinned(e.target.checked)}
                        className="rounded text-[#d72638] focus:ring-[#d72638]"
                      />
                      Fixar Nota
                    </label>
                    <button 
                      onClick={handleSaveNote}
                      className="bg-[#d72638] text-white px-6 py-2 rounded-lg hover:bg-[#b91f2f] flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" /> Salvar Nota
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload File Section */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#d72638]" />
                  Upload de Arquivos
                </h3>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium mb-2">
                      Clique para selecionar ou arraste
                    </p>
                    <p className="text-sm text-gray-400">
                      Imagens, PDFs, Documentos
                    </p>
                  </label>
                  {uploading && <p className="mt-4 text-[#d72638]">Enviando...</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

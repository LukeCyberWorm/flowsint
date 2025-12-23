import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Shield, Menu, Bell, Settings, LogOut, Database, User, Car, Phone, Mail, FileText } from 'lucide-react'
import { workApi } from '../api/workApi'

type SearchModule = 'cpf' | 'cnpj' | 'placa' | 'phone' | 'email' | 'nome'

export default function RSLSearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [module, setModule] = useState<SearchModule>('cpf')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      let response
      switch (module) {
        case 'cpf':
          response = await workApi.searchCpf(query)
          break
        case 'cnpj':
          response = await workApi.searchCnpj(query)
          break
        case 'placa':
          response = await workApi.searchPlaca(query)
          break
        case 'phone':
          response = await workApi.searchTelefone(query)
          break
        case 'email':
          response = await workApi.searchEmail(query)
          break
        case 'nome':
          response = await workApi.searchNome(query)
          break
      }
      setResult(response?.data)
    } catch (err: any) {
      console.error(err)
      setError('Erro ao buscar dados. Verifique o termo pesquisado ou tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111] border-r border-[#222] flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-[#222]">
          <Shield className="w-8 h-8 text-[#d72638]" />
          <div>
            <h1 className="font-bold text-lg tracking-wider">RSL</h1>
            <p className="text-xs text-gray-500">Red Shadow Link</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#d72638]/10 text-[#d72638] rounded-lg border border-[#d72638]/20">
            <Search className="w-5 h-5" />
            <span className="font-medium">Busca RSL</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-[#1a1a1a] rounded-lg transition">
            <Database className="w-5 h-5" />
            <span className="font-medium">Histórico</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-[#1a1a1a] rounded-lg transition">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Configurações</span>
          </button>
        </nav>

        <div className="p-4 border-t border-[#222]">
          <button 
            onClick={() => navigate('/login')}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-[#1a1a1a] rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-[#111] border-b border-[#222] flex items-center justify-between px-6">
          <div className="flex items-center gap-4 text-gray-400">
            <Menu className="w-5 h-5 cursor-pointer hover:text-white" />
            <span className="text-sm">
              <span className="cursor-pointer hover:text-white" onClick={() => navigate('/admin')}>Dashboard</span> / Busca
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
            <div className="w-8 h-8 bg-[#d72638] rounded-full flex items-center justify-center font-bold">
              A
            </div>
          </div>
        </header>

        {/* Search Area */}
        <div className="p-8 max-w-6xl mx-auto w-full">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-2">Busca Unificada RSL</h2>
            <p className="text-gray-400">Acesse bases de dados integradas em tempo real</p>
          </div>

          <div className="bg-[#111] p-6 rounded-xl border border-[#222] shadow-2xl mb-8">
            {/* Module Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {[
                { id: 'cpf', label: 'CPF', icon: User },
                { id: 'cnpj', label: 'CNPJ', icon: FileText },
                { id: 'placa', label: 'Veículo', icon: Car },
                { id: 'phone', label: 'Telefone', icon: Phone },
                { id: 'email', label: 'Email', icon: Mail },
                { id: 'nome', label: 'Nome', icon: User },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModule(m.id as SearchModule)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                    module === m.id
                      ? 'bg-[#d72638] text-white'
                      : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#222]'
                  }`}
                >
                  <m.icon className="w-4 h-4" />
                  {m.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Digite o ${module.toUpperCase()} para buscar...`}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg py-4 pl-12 pr-32 text-white focus:outline-none focus:border-[#d72638] transition text-lg"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6" />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 bg-[#d72638] text-white px-6 rounded-md font-medium hover:bg-[#b91f2f] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Buscando...' : 'Pesquisar'}
              </button>
            </form>
          </div>

          {/* Results */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-8">
              {error}
            </div>
          )}

          {result && (
            <div className="bg-[#111] rounded-xl border border-[#222] overflow-hidden">
              <div className="p-4 border-b border-[#222] bg-[#1a1a1a] flex justify-between items-center">
                <h3 className="font-bold text-lg">Resultados da Busca</h3>
                <span className="text-xs text-gray-500 font-mono">JSON RAW</span>
              </div>
              <div className="p-6 overflow-x-auto">
                <pre className="font-mono text-sm text-green-400 whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          {!result && !loading && !error && (
            <div className="text-center py-20 text-gray-500">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>Selecione um módulo e faça uma busca para ver os resultados</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

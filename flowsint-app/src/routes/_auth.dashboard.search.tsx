import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Search, Globe, Mail, Phone, User, Building2, Hash, MapPin, Calendar, Car, Download, FilePlus, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { workApi } from '@/api/work-api'
import { dossierService, Dossier } from '@/api/dossier-service'
import { toast } from 'sonner'

export const Route = createFileRoute('/_auth/dashboard/search')({
  component: SearchPage
})

interface SearchCategory {
  id: string
  name: string
  icon: typeof Search
  description: string
  placeholder: string
}

const searchCategories: SearchCategory[] = [
  {
    id: 'cpf',
    name: 'CPF',
    icon: User,
    description: 'Buscar dados completos por CPF',
    placeholder: '000.000.000-00'
  },
  {
    id: 'cnpj',
    name: 'CNPJ',
    icon: Building2,
    description: 'Investigar empresas por CNPJ',
    placeholder: '00.000.000/0000-00'
  },
  {
    id: 'placa',
    name: 'Veículo',
    icon: Car,
    description: 'Buscar dados de veículo por Placa',
    placeholder: 'ABC-1234'
  },
  {
    id: 'phone',
    name: 'Telefone',
    icon: Phone,
    description: 'Pesquisar por número de telefone',
    placeholder: '11999999999'
  },
  {
    id: 'email',
    name: 'E-mail',
    icon: Mail,
    description: 'Investigar endereços de e-mail',
    placeholder: 'usuario@exemplo.com'
  },
  {
    id: 'nome',
    name: 'Nome',
    icon: User,
    description: 'Buscar por nome completo',
    placeholder: 'Nome completo'
  }
]

function SearchPage() {
  const [activeCategory, setActiveCategory] = useState('cpf')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [dossiers, setDossiers] = useState<Dossier[]>([])
  const [selectedDossierId, setSelectedDossierId] = useState<string>('')

  const currentCategory = searchCategories.find((cat) => cat.id === activeCategory)

  useEffect(() => {
    fetchDossiers()
  }, [])

  const fetchDossiers = async () => {
    try {
      const data = await dossierService.getAllDossiers()
      setDossiers(data)
    } catch (error) {
      console.error('Erro ao carregar dossiês:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    setError('')
    setResult(null)
    
    try {
      let response
      switch (activeCategory) {
        case 'cpf':
          response = await workApi.searchCpf(searchQuery)
          break
        case 'cnpj':
          response = await workApi.searchCnpj(searchQuery)
          break
        case 'placa':
          response = await workApi.searchPlaca(searchQuery)
          break
        case 'phone':
          response = await workApi.searchTelefone(searchQuery)
          break
        case 'email':
          response = await workApi.searchEmail(searchQuery)
          break
        case 'nome':
          response = await workApi.searchNome(searchQuery)
          break
        default:
          throw new Error('Categoria inválida')
      }
      setResult(response.data)
    } catch (err: any) {
      console.error(err)
      setError('Erro ao buscar dados. Verifique o termo ou tente novamente.')
      toast.error('Erro na busca')
    } finally {
      setIsSearching(false)
    }
  }

  const handleExportToCase = async () => {
    if (!selectedDossierId || !result) {
      toast.error('Selecione um caso e realize uma busca primeiro')
      return
    }

    try {
      const content = `## Resultado de Busca RSL (${activeCategory.toUpperCase()})\n\n**Termo:** ${searchQuery}\n**Data:** ${new Date().toLocaleString()}\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``
      await dossierService.createNote(selectedDossierId, content)
      toast.success('Dados exportados para o caso com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao exportar para o caso')
    }
  }

  const handleDownloadJson = () => {
    if (!result) return
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", `rsl_search_${activeCategory}_${searchQuery}.json`)
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  return (
    <div className="h-full w-full overflow-auto bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-red-600">RSL Search Intelligence</h1>
            <p className="text-muted-foreground">
              Acesse bases de dados integradas em tempo real (Work Consultoria API)
            </p>
          </div>
          <div className="flex gap-2">
             {/* Actions Header */}
          </div>
        </div>

        {/* Search Categories */}
        <Tabs value={activeCategory} onValueChange={(val) => { setActiveCategory(val); setResult(null); setError(''); }} className="mb-6">
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-2 h-auto p-2 bg-muted/50">
            {searchCategories.map((category) => {
              const Icon = category.icon
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-red-600 data-[state=active]:text-white"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{category.name}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Search Input Section */}
          <div className="mt-6">
            <Card className="border-red-900/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="flex items-center gap-2">
                  {currentCategory && <currentCategory.icon className="h-5 w-5 text-red-500" />}
                  <CardTitle>Buscar {currentCategory?.name}</CardTitle>
                </div>
                <CardDescription>{currentCategory?.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder={currentCategory?.placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 text-lg h-12"
                  />
                  <Button onClick={handleSearch} disabled={isSearching} className="h-12 px-8 bg-red-600 hover:bg-red-700">
                    <Search className="h-4 w-4 mr-2" />
                    {isSearching ? 'Buscando...' : 'Pesquisar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Area */}
          <div className="mt-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            {result && (
              <Card className="border-red-900/20">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Resultados da Busca</CardTitle>
                    <CardDescription>Dados retornados pela API</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedDossierId} onValueChange={setSelectedDossierId}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Selecione um caso..." />
                      </SelectTrigger>
                      <SelectContent>
                        {dossiers.map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.title || d.case_number}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={handleExportToCase} disabled={!selectedDossierId}>
                      <FilePlus className="h-4 w-4 mr-2" />
                      Exportar para Caso
                    </Button>
                    <Button variant="outline" onClick={handleDownloadJson}>
                      <Download className="h-4 w-4 mr-2" />
                      JSON
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-lg overflow-auto max-h-[600px]">
                    <pre className="text-sm font-mono text-green-500 whitespace-pre-wrap">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {!result && !isSearching && !error && (
              <div className="text-center p-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Selecione um módulo e faça uma busca para ver os resultados</p>
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  )
}

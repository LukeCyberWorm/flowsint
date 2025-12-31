import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Search, Globe, Mail, Phone, User, Building2, Hash, MapPin, Calendar, Car, Download, FilePlus, AlertCircle, Copy, CreditCard, Briefcase, Home, FileText, DollarSign, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ownDataApi } from '@/api/owndata-api'
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
  const [searchSource, setSearchSource] = useState<'work' | 'owndata'>('work') // BUSCA COMPLETA ou DEEPFINDER
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [dossiers, setDossiers] = useState<Dossier[]>([])
  const [selectedDossierId, setSelectedDossierId] = useState<string>('')

  const currentCategory = searchCategories.find((cat) => cat.id === activeCategory)

  // Função para normalizar dados da OwnData para o formato da Work API
  const normalizeOwnDataResponse = (data: any) => {
    if (!data || typeof data !== 'object') return data

    // Se já estiver no formato correto, retorna
    if (data.dadosBasicos || data.nome || data.cpf) return data

    // Normaliza estrutura de dados da OwnData
    const normalized: any = {}

    // Dados pessoais - SEMPRE converter para string
    if (data.NOME || data.CPF) {
      normalized.dadosBasicos = {
        nome: String(data.NOME || data.nome || ''),
        cpf: String(data.CPF || data.cpf || ''),
        dataNascimento: String(data.DATA_NASCIMENTO || data.dataNascimento || ''),
        sexo: String(data.SEXO || data.sexo || ''),
        nomeMae: String(data.NOME_MAE || data.nomeMae || data.mae || ''),
        nomePai: String(data.NOME_PAI || data.nomePai || data.pai || ''),
        municipioNascimento: String(data.MUNICIPIO_NASCIMENTO || data.municipioNascimento || ''),
        nacionalidade: String(data.NACIONALIDADE || data.nacionalidade || 'BRASILEIRA'),
      }
    }

    // Foto
    if (data.FOTO || data.foto) {
      normalized.foto = {
        foto: data.FOTO || data.foto
      }
    }

    // Endereços - SEMPRE converter para string
    if (data.ENDERECOS || data.enderecos) {
      const enderecos = data.ENDERECOS || data.enderecos
      normalized.enderecos = Array.isArray(enderecos) ? enderecos.map((end: any) => ({
        logradouro: String(end.LOGRADOURO || end.logradouro || ''),
        numero: String(end.NUMERO || end.numero || ''),
        complemento: String(end.COMPLEMENTO || end.complemento || ''),
        bairro: String(end.BAIRRO || end.bairro || ''),
        cidade: String(end.CIDADE || end.cidade || end.municipio || ''),
        uf: String(end.UF || end.uf || ''),
        cep: String(end.CEP || end.cep || '')
      })) : []
    }

    // Telefones - SEMPRE converter para string
    if (data.TELEFONES || data.telefones) {
      const telefones = data.TELEFONES || data.telefones
      normalized.telefones = Array.isArray(telefones) ? telefones.map((tel: any) => ({
        telefone: String(tel.TELEFONE || tel.telefone || tel || '')
      })) : []
    }

    // Título de eleitor - SEMPRE converter para string
    if (data.TITULO_ELEITOR || data.tituloEleitor) {
      normalized.tituloEleitor = {
        tituloEleitorNumero: String(data.TITULO_ELEITOR || data.tituloEleitor || ''),
        zonaTitulo: String(data.ZONA || data.zona || ''),
        secaoTitulo: String(data.SECAO || data.secao || '')
      }
    }

    // Se tiver dados normalizados, retorna, senão retorna original
    return Object.keys(normalized).length > 0 ? normalized : data
  }

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
      
      // Escolher API baseada na fonte selecionada
      if (searchSource === 'work') {
        // BUSCA COMPLETA - Work API
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
      } else {
        // DEEPFINDER - OwnData API
        switch (activeCategory) {
          case 'cpf':
            response = await ownDataApi.searchCpf(searchQuery)
            break
          case 'cnpj':
            response = await ownDataApi.searchCnpj(searchQuery)
            break
          case 'placa':
            toast.error('Busca por placa não está disponível no DEEPFINDER')
            setIsSearching(false)
            return
          case 'phone':
            response = await ownDataApi.searchTelefone(searchQuery)
            break
          case 'email':
            response = await ownDataApi.searchEmail(searchQuery)
            break
          case 'nome':
            response = await ownDataApi.searchNome(searchQuery)
            break
          default:
            throw new Error('Categoria inválida')
        }
      }
      
      console.log('Result data:', response)
      
      if (response.success) {
        console.log('Setting result:', response.data)
        
        // Verificar se há dados reais ou se é um 404 (sem dados encontrados)
        if (response.data?.status === 404 || response.data?.statusMsg === 'Not found') {
          setResult(null)
          setError(response.data?.reason || 'Nenhum dado encontrado para esta consulta')
          toast.warning('Nenhum dado encontrado na base de dados para esta consulta')
        } else {
          // Se for OwnData, normaliza os dados para o formato da Work API
          const normalizedData = searchSource === 'owndata' 
            ? normalizeOwnDataResponse(response.data) 
            : response.data
          
          setResult(normalizedData)
          toast.success('Busca realizada com sucesso!')
        }
      } else {
        console.log('Error response:', response.error)
        setError(response.error || 'Erro ao buscar dados')
        toast.error(response.error || 'Erro na busca')
      }
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
              Escolha a fonte de dados e realize buscas integradas em tempo real
            </p>
          </div>
          <div className="flex gap-2">
             {/* Actions Header */}
          </div>
        </div>

        {/* Data Source Selection */}
        <Card className="mb-6 border-red-900/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Fonte de Dados</CardTitle>
            <CardDescription>Selecione qual base de dados deseja utilizar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSearchSource('work')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  searchSource === 'work'
                    ? 'border-red-600 bg-red-600/10 shadow-lg'
                    : 'border-muted hover:border-red-600/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="h-6 w-6 text-red-600" />
                  <h3 className="text-xl font-bold">BUSCA COMPLETA</h3>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  Base de dados Work Consultoria com informações detalhadas e atualizadas
                </p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">CPF</Badge>
                  <Badge variant="outline" className="text-xs">CNPJ</Badge>
                  <Badge variant="outline" className="text-xs">Telefone</Badge>
                  <Badge variant="outline" className="text-xs">Email</Badge>
                  <Badge variant="outline" className="text-xs">Placa</Badge>
                  <Badge variant="outline" className="text-xs">Nome</Badge>
                </div>
              </button>

              <button
                onClick={() => setSearchSource('owndata')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  searchSource === 'owndata'
                    ? 'border-blue-600 bg-blue-600/10 shadow-lg'
                    : 'border-muted hover:border-blue-600/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Search className="h-6 w-6 text-blue-600" />
                  <h3 className="text-xl font-bold">DEEPFINDER</h3>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  Base de dados OwnData com consultas alternativas
                </p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">CPF</Badge>
                  <Badge variant="outline" className="text-xs">CNPJ</Badge>
                  <Badge variant="outline" className="text-xs">Telefone</Badge>
                  <Badge variant="outline" className="text-xs">Email</Badge>
                  <Badge variant="outline" className="text-xs">Nome</Badge>
                  <Badge variant="outline" className="text-xs">CEP</Badge>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

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
              <>
                {/* Debug - remover depois */}
                {console.log('Result data:', result)}
                
                {/* Dados Pessoais */}
                {(result.dadosBasicos || result.nome || result.cpf) && (
                  <Card className="border-red-900/20 mb-4">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-red-500" />
                          <CardTitle>Dados Pessoais</CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(searchQuery)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Nome Completo</p>
                          <p className="font-semibold text-lg">{result.dadosBasicos?.nome || result.nome || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">CPF</p>
                          <p className="font-mono">{result.dadosBasicos?.cpf || result.cpf || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">CNS</p>
                          <p className="font-mono">{result.dadosBasicos?.cns || result.cns || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Data de Nascimento</p>
                          <p className="font-semibold">{result.dadosBasicos?.dataNascimento || result.dataNascimento || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Sexo</p>
                          <p className="font-semibold">{result.dadosBasicos?.sexo || result.sexo || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Cor</p>
                          <p className="font-semibold">{result.dadosBasicos?.cor || result.cor || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Mãe</p>
                          <p className="font-semibold">{result.dadosBasicos?.nomeMae || result.nomeMae || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Pai</p>
                          <p className="font-semibold">{result.dadosBasicos?.nomePai || result.nomePai || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Município de Nascimento</p>
                          <p className="font-semibold">{result.dadosBasicos?.municipioNascimento || result.municipioNascimento || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Escolaridade</p>
                          <p className="font-semibold">{result.dadosBasicos?.escolaridade || result.escolaridade || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Estado Civil</p>
                          <p className="font-semibold">{result.dadosBasicos?.estadoCivil || result.estadoCivil || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Nacionalidade</p>
                          <p className="font-semibold">{result.dadosBasicos?.nacionalidade || result.nacionalidade || 'N/A'}</p>
                        </div>
                      </div>
                      
                      {result.dadosBasicos.obito && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <p className="font-semibold text-red-500">Óbito: {result.dadosBasicos.obito.obito}</p>
                            {result.dadosBasicos.obito.dataObito !== 'Não consta.' && (
                              <p className="text-sm text-muted-foreground">Data: {result.dadosBasicos.obito.dataObito}</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {result.dadosBasicos.situacaoCadastral && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Situação Cadastral</p>
                          <p className="font-semibold">{result.dadosBasicos.situacaoCadastral}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Foto */}
                {result.foto && result.foto.foto && (
                  <Card className="border-red-900/20 mb-4">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-red-500" />
                        <CardTitle>Imagem Cadastral</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      <div className="w-48 h-48 bg-muted rounded-lg overflow-hidden border-2 border-red-900/20">
                        <img src={result.foto.foto} alt="Foto Cadastral" className="w-full h-full object-cover" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Registro Geral (RG) */}
                {result.registroGeral && (
                  <Card className="border-red-900/20 mb-4">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-red-500" />
                        <CardTitle>Registro Geral</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">RG Número</p>
                          <p className="font-semibold text-lg">{result.registroGeral || 'N/A'}</p>
                        </div>
                        {result.registroGeralDetalhes && (
                          <>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Órgão Emissor</p>
                              <p className="font-semibold">{result.registroGeralDetalhes.orgaoEmissor || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">UF Emissão</p>
                              <p className="font-semibold">{result.registroGeralDetalhes.ufEmissao || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Data de Emissão</p>
                              <p className="font-semibold">{result.registroGeralDetalhes.dataEmissao || 'N/A'}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Título de Eleitor */}
                {result.tituloEleitor && result.tituloEleitor !== 'N/A' && (
                  <Card className="border-red-900/20 mb-4">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-red-500" />
                        <CardTitle>Título de Eleitor</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Número do Título</p>
                          <p className="font-mono text-lg">
                            {typeof result.tituloEleitor === 'object' 
                              ? (result.tituloEleitor.tituloEleitorNumero || 'N/A')
                              : (result.tituloEleitor || 'N/A')}
                          </p>
                        </div>
                        {(result.tituloEleitorDetalhes || typeof result.tituloEleitor === 'object') && (
                          <>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Zona</p>
                              <p className="font-semibold">
                                {typeof result.tituloEleitor === 'object' 
                                  ? (result.tituloEleitor.zonaTitulo || 'N/A')
                                  : (result.tituloEleitorDetalhes?.zona || 'N/A')}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Seção</p>
                              <p className="font-semibold">
                                {typeof result.tituloEleitor === 'object' 
                                  ? (result.tituloEleitor.secaoTitulo || 'N/A')
                                  : (result.tituloEleitorDetalhes?.secao || 'N/A')}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Endereços */}
                {result.enderecos && result.enderecos.length > 0 && (
                  <Card className="border-red-900/20 mb-4">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-red-500" />
                        <CardTitle>Endereços</CardTitle>
                        <Badge variant="secondary">{result.enderecos.length}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {result.enderecos.map((end: any, idx: number) => (
                          <div key={idx} className="p-4 bg-muted/50 rounded-lg">
                            <p className="font-semibold text-lg mb-2">
                              {end.logradouro}, {end.numero} {end.complemento && `- ${end.complemento}`}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Bairro</p>
                                <p className="font-medium">{end.bairro}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Cidade</p>
                                <p className="font-medium">{end.cidade}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">UF</p>
                                <p className="font-medium">{end.uf}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">CEP</p>
                                <p className="font-mono">{end.cep}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Telefones */}
                {result.telefones && result.telefones.length > 0 && (
                  <Card className="border-red-900/20 mb-4">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-red-500" />
                        <CardTitle>Telefones</CardTitle>
                        <Badge variant="secondary">{result.telefones.length}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {result.telefones.map((tel: any, idx: number) => (
                          <div key={idx} className="p-3 bg-muted/50 rounded-lg flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <p className="font-mono font-semibold">{tel.telefone || tel}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Dados Econômicos */}
                {result.dadosEconomicos && (
                  <Card className="border-red-900/20 mb-4">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-red-500" />
                        <CardTitle>Dados Econômicos</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Renda Estimada</p>
                          <p className="font-semibold text-2xl text-green-500">{result.dadosEconomicos.rendaEstimada || result.dadosEconomicos}</p>
                        </div>
                        {result.dadosEconomicos.poderAquisitivo && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Poder Aquisitivo</p>
                            <p className="font-semibold">{result.dadosEconomicos.poderAquisitivo}</p>
                          </div>
                        )}
                        {result.dadosEconomicos.faixaRenda && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Faixa de Renda</p>
                            <p className="font-semibold">{result.dadosEconomicos.faixaRenda}</p>
                          </div>
                        )}
                        {result.dadosEconomicos.scoreCSB && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Score CSB</p>
                            <p className="font-semibold text-xl">{result.dadosEconomicos.scoreCSB}</p>
                          </div>
                        )}
                        {result.dadosEconomicos.faixaRiscoCSB && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Faixa de Risco CSB</p>
                            <Badge variant="outline">{result.dadosEconomicos.faixaRiscoCSB}</Badge>
                          </div>
                        )}
                        {result.dadosEconomicos.scoreCsba && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Score CSBA</p>
                            <p className="font-semibold text-xl">{result.dadosEconomicos.scoreCsba}</p>
                          </div>
                        )}
                      </div>
                      
                      {result.dadosEconomicos.score && (
                        <div className="mt-6">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold">Score</p>
                            <div className="flex items-center gap-2">
                              <p className="text-3xl font-bold text-yellow-500">{result.dadosEconomicos.score}</p>
                              <Badge className="bg-yellow-500">Bom</Badge>
                            </div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full transition-all"
                              style={{ width: `${(parseInt(result.dadosEconomicos.score) / 1000) * 100}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>0</span>
                            <span>500</span>
                            <span>1000</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Dados de Imposto */}
                {result.dadosImposto && result.dadosImposto.length > 0 && (
                  <Card className="border-red-900/20 mb-4">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-red-500" />
                        <CardTitle>Dados Imposto</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.dadosImposto.map((imposto: any, idx: number) => (
                          <div key={idx} className="p-4 bg-muted/50 rounded-lg">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">CPF</p>
                                <p className="font-mono font-semibold">{imposto.cpf}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Banco</p>
                                <p className="font-medium">{imposto.banco}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Agência</p>
                                <p className="font-mono">{imposto.agencia}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Lote</p>
                                <p className="font-mono">{imposto.lote}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Ano</p>
                                <p className="font-semibold">{imposto.ano}</p>
                              </div>
                            </div>
                            {imposto.dataLote && (
                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground">Data do Lote: {imposto.dataLote}</p>
                              </div>
                            )}
                            <div className="mt-2">
                              <Badge variant={imposto.status === 'CREDITADA' ? 'default' : 'destructive'}>
                                {imposto.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Empresas */}
                {result.empresas && result.empresas.length > 0 && result.empresas !== "Nenhum dado encontrado." && (
                  <Card className="border-red-900/20 mb-4">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-red-500" />
                        <CardTitle>Empresas</CardTitle>
                        <Badge variant="secondary">{result.empresas.length}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.empresas.map((empresa: any, idx: number) => (
                          <div key={idx} className="p-4 bg-muted/50 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-muted-foreground text-sm">CNPJ</p>
                                <p className="font-mono font-semibold">{empresa.cnpj}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-sm">Tipo Relação</p>
                                <p className="font-medium">{empresa.tipoRelacao}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-sm">Admissão</p>
                                <p className="font-semibold">{empresa.admissao}</p>
                              </div>
                              {empresa.demissao && (
                                <div>
                                  <p className="text-muted-foreground text-sm">Demissão</p>
                                  <p className="font-semibold">{empresa.demissao}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Botões de Ação */}
                <Card className="border-red-900/20 sticky bottom-4 bg-card/95 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2 items-center justify-between">
                      <Select value={selectedDossierId} onValueChange={setSelectedDossierId}>
                        <SelectTrigger className="w-[250px]">
                          <SelectValue placeholder="Selecione um caso..." />
                        </SelectTrigger>
                        <SelectContent>
                          {dossiers.map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.title || d.case_number}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExportToCase} disabled={!selectedDossierId}>
                          <FilePlus className="h-4 w-4 mr-2" />
                          Exportar para Caso
                        </Button>
                        <Button variant="outline" onClick={handleDownloadJson}>
                          <Download className="h-4 w-4 mr-2" />
                          Baixar JSON
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
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

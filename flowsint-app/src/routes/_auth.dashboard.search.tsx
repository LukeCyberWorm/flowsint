import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Search, Globe, Mail, Phone, User, Building2, Hash, MapPin, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

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
    id: 'domain',
    name: 'Domínio',
    icon: Globe,
    description: 'Buscar informações sobre domínios e websites',
    placeholder: 'exemplo.com'
  },
  {
    id: 'email',
    name: 'E-mail',
    icon: Mail,
    description: 'Investigar endereços de e-mail',
    placeholder: 'usuario@exemplo.com'
  },
  {
    id: 'phone',
    name: 'Telefone',
    icon: Phone,
    description: 'Pesquisar números de telefone',
    placeholder: '+55 11 99999-9999'
  },
  {
    id: 'person',
    name: 'Pessoa',
    icon: User,
    description: 'Buscar informações sobre indivíduos',
    placeholder: 'Nome completo'
  },
  {
    id: 'company',
    name: 'Empresa',
    icon: Building2,
    description: 'Investigar empresas e organizações',
    placeholder: 'Nome da empresa'
  },
  {
    id: 'ip',
    name: 'Endereço IP',
    icon: Hash,
    description: 'Analisar endereços IP',
    placeholder: '192.168.1.1'
  },
  {
    id: 'location',
    name: 'Localização',
    icon: MapPin,
    description: 'Buscar por endereços e localizações',
    placeholder: 'Endereço completo'
  },
  {
    id: 'date',
    name: 'Data/Evento',
    icon: Calendar,
    description: 'Pesquisar eventos por data',
    placeholder: 'DD/MM/AAAA'
  }
]

function SearchPage() {
  const [activeCategory, setActiveCategory] = useState('domain')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const currentCategory = searchCategories.find((cat) => cat.id === activeCategory)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    // Aqui você implementará a lógica de busca
    console.log('Buscando:', { category: activeCategory, query: searchQuery })
    
    // Simulação de busca
    setTimeout(() => {
      setIsSearching(false)
    }, 1500)
  }

  return (
    <div className="h-full w-full overflow-auto bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Painel de Buscas OSINT</h1>
          <p className="text-muted-foreground">
            Realize buscas avançadas em múltiplas fontes de inteligência
          </p>
        </div>

        {/* Search Categories */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2 h-auto p-2">
            {searchCategories.map((category) => {
              const Icon = category.icon
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex flex-col items-center gap-1 py-3"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{category.name}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Search Input Section */}
          <div className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {currentCategory && <currentCategory.icon className="h-5 w-5" />}
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
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} disabled={isSearching}>
                    <Search className="h-4 w-4 mr-2" />
                    {isSearching ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results for each category */}
          {searchCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resultados da Busca</CardTitle>
                  <CardDescription>
                    {searchQuery
                      ? `Buscando "${searchQuery}" em ${category.name.toLowerCase()}`
                      : 'Digite algo e clique em buscar para ver os resultados'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {searchQuery && !isSearching ? (
                    <div className="space-y-4">
                      {/* Exemplo de resultado - você substituirá isso com dados reais */}
                      <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">Exemplo de Resultado</h3>
                          <Badge variant="outline">Verificado</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Esta é uma demonstração de como os resultados serão exibidos. 
                          Integre com suas APIs e fontes de dados aqui.
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="secondary">Fonte: Demo</Badge>
                          <Badge variant="secondary">Confiança: Alta</Badge>
                        </div>
                      </div>

                      {/* Placeholder para mais resultados */}
                      <div className="text-center p-8 text-muted-foreground">
                        <p>Nenhum resultado adicional encontrado.</p>
                        <p className="text-sm mt-2">
                          Conecte suas ferramentas OSINT para obter resultados reais.
                        </p>
                      </div>
                    </div>
                  ) : isSearching ? (
                    <div className="text-center p-8">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Analisando fontes de dados...</p>
                    </div>
                  ) : (
                    <div className="text-center p-8 text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Insira um termo de busca para começar</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Quick Actions / Tools */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Ferramentas Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base">WHOIS Lookup</CardTitle>
                <CardDescription>Informações de registro de domínio</CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base">DNS Lookup</CardTitle>
                <CardDescription>Resolução de DNS e subdominios</CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base">Social Search</CardTitle>
                <CardDescription>Busca em redes sociais</CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base">Breach Check</CardTitle>
                <CardDescription>Verificar vazamentos de dados</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

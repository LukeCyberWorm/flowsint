import { createFileRoute } from '@tanstack/react-router'
import { BookOpen, Zap, Shield, Database, Workflow, Search, Key, Users, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_auth/dashboard/docs')({
  component: DocsPage
})

function DocsPage() {
  const handleDownloadPDF = () => {
    // Criar conteúdo do PDF com a documentação
    const printWindow = window.open('', '', 'height=600,width=800')
    if (printWindow) {
      printWindow.document.write('<html><head><title>RSL-Scarlet Documentation</title>')
      printWindow.document.write('<style>')
      printWindow.document.write(`
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { color: #dc2638; border-bottom: 3px solid #dc2638; padding-bottom: 10px; }
        h2 { color: #ff4b5c; margin-top: 30px; border-bottom: 2px solid #eee; padding-bottom: 5px; }
        h3 { color: #333; margin-top: 20px; }
        p { line-height: 1.6; color: #444; }
        .section { margin-bottom: 30px; }
        .feature-box { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
      `)
      printWindow.document.write('</style></head><body>')
      
      // Copiar o conteúdo da documentação
      const docContent = document.querySelector('.container')
      if (docContent) {
        // Remove botão de download antes de copiar
        const clonedContent = docContent.cloneNode(true) as HTMLElement
        const downloadBtn = clonedContent.querySelector('.download-pdf-btn')
        if (downloadBtn) downloadBtn.remove()
        
        printWindow.document.write(clonedContent.innerHTML)
      }
      
      printWindow.document.write('</body></html>')
      printWindow.document.close()
      
      // Esperar carregar e então imprimir
      printWindow.onload = () => {
        printWindow.print()
        printWindow.close()
      }
    }
  }

  return (
    <div className="h-full w-full bg-background overflow-y-auto">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#ff4b5c] to-[#d72638] bg-clip-text text-transparent">
              Red Shadow Link (RSL-Scarlet)
            </h1>
            <p className="text-muted-foreground text-lg">
              Plataforma OSINT completa da Scarlet Red Solutions
            </p>
          </div>
          <Button 
            onClick={handleDownloadPDF}
            className="download-pdf-btn bg-[#dc2638] hover:bg-[#c01f2f] text-white flex items-center gap-2"
            size="default"
          >
            <Download className="h-4 w-4" />
            Baixar PDF
          </Button>
        </div>

      {/* Introdução */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-[#dc2638]" />
          Introdução
        </h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-muted-foreground leading-relaxed mb-4">
            O RSL-Scarlet (Red Shadow Link) é uma plataforma avançada de OSINT (Open Source Intelligence) 
            baseada em grafos, desenvolvida pela Scarlet Red Solutions. Projetada para profissionais de 
            segurança, investigadores digitais e analistas forenses, oferece ferramentas poderosas de 
            automação e análise de dados para conduzir investigações complexas de forma eficiente e segura.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-white">Privacidade em Primeiro Lugar:</strong> Toda a infraestrutura 
            roda localmente. Todos os dados de investigação, credenciais e informações sensíveis são 
            armazenados criptografados em sua própria máquina, garantindo total controle e privacidade.
          </p>
        </div>
      </section>

      {/* Arquitetura do Sistema */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">🏗️ Arquitetura do Sistema</h2>
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-[#dc2638]">Interface Web</h3>
            <p className="text-sm text-muted-foreground">
              Interface React + Vite + TypeScript com TanStack Router. Visualização de grafos interativa, 
              editor de flows drag-and-drop, e sistema de busca rápida (Ctrl+K).
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-[#dc2638]">API Backend</h3>
            <p className="text-sm text-muted-foreground">
              API FastAPI (Python) com autenticação JWT, sistema de filas Celery para processamento 
              assíncrono, e integração com Neo4j (grafos) e PostgreSQL (dados relacionais).
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-[#dc2638]">Biblioteca Core</h3>
            <p className="text-sm text-muted-foreground">
              Biblioteca principal contendo classes base de transforms, orquestrador de pipelines, 
              registro de transforms, conectores de banco de dados e sistema de cofre criptografado.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-[#dc2638]">Módulo de Transforms</h3>
            <p className="text-sm text-muted-foreground">
              Coleção de mais de 30 transforms OSINT organizados por categoria: Domain, IP, Email, 
              Phone, Crypto, Social Media, Organization e muito mais.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-[#dc2638]">Sistema de Tipos</h3>
            <p className="text-sm text-muted-foreground">
              Definições de tipos e esquemas de dados compartilhados entre todos os módulos do sistema.
            </p>
          </div>
        </div>
      </section>

      {/* Recursos Principais */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Zap className="h-6 w-6 text-[#dc2638]" />
          Recursos Principais
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <FeatureCard
            icon={<Workflow className="h-8 w-8 text-[#dc2638]" />}
            title="Flows Automatizados"
            description="Crie fluxos de investigação personalizados combinando diferentes transforms. Automatize coleta de dados, enriquecimento e análise."
          />
          
          <FeatureCard
            icon={<Database className="h-8 w-8 text-[#dc2638]" />}
            title="Investigações"
            description="Gerencie casos complexos com suporte a múltiplos usuários. Organize evidências, adicione notas e compartilhe descobertas com sua equipe."
          />
          
          <FeatureCard
            icon={<Shield className="h-8 w-8 text-[#dc2638]" />}
            title="Cofre Seguro"
            description="Armazene credenciais e dados sensíveis com criptografia de ponta a ponta. Acesso controlado e auditoria completa."
          />
          
          <FeatureCard
            icon={<Search className="h-8 w-8 text-[#dc2638]" />}
            title="Busca Inteligente"
            description="Navegação rápida com Ctrl+K. Busque investigações, flows, documentação e execute ações instantaneamente."
          />
        </div>
      </section>

      {/* Guia de Início Rápido */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Key className="h-6 w-6 text-[#dc2638]" />
          🚀 Guia de Início Rápido
        </h2>
        
        <div className="space-y-6">
          <QuickStartStep
            number="1"
            title="Crie sua primeira investigação"
            description="Vá para a aba 'Investigações' e clique em 'Create investigation'. Defina um nome descritivo (ex: 'Análise de Domínio - empresa.com'), adicione uma descrição com o objetivo da investigação e comece a adicionar entidades clicando no grafo."
          />
          
          <QuickStartStep
            number="2"
            title="Adicione entidades ao grafo"
            description="Clique com botão direito no grafo vazio e selecione 'Add Node'. Escolha o tipo de entidade (Domain, IP, Email, etc.) e preencha os dados. As entidades aparecerão no grafo com cores diferentes por tipo."
          />
          
          <QuickStartStep
            number="3"
            title="Execute transforms nas entidades"
            description="Clique com botão direito em uma entidade no grafo e selecione 'Run Transform'. Escolha o transform desejado (ex: DNS Resolution) e aguarde o processamento. Novas entidades relacionadas aparecerão automaticamente conectadas."
          />

          <QuickStartStep
            number="4"
            title="Configure um Flow automatizado"
            description="Na aba 'Flows', clique em 'Create Flow'. Use o editor drag-and-drop para criar pipelines de transforms sequenciais. Configure entradas, saídas e condições. Salve e execute o flow em qualquer entidade compatível."
          />
          
          <QuickStartStep
            number="5"
            title="Armazene credenciais no Cofre"
            description="Vá para 'Vault' e adicione suas API keys e credenciais. Selecione o tipo (API Key, Credential, SSH Key, etc.), defina um nome, adicione tags e cole o valor. Tudo é criptografado com AES-256 antes de ser salvo."
          />
          
          <QuickStartStep
            number="6"
            title="Exporte e compartilhe resultados"
            description="Após concluir a investigação, use os botões de exportação para gerar relatórios em PDF, JSON ou GraphML. Compartilhe com sua equipe ou arquive para documentação futura."
          />
        </div>

        <div className="mt-6 bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-[#dc2638]">📌 Casos de Uso Comuns</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Reconhecimento de Infraestrutura:</strong> Domain → Subdomains → IPs → ASN → Organization</li>
            <li>• <strong>Investigação de Pessoa:</strong> Email → Breaches + Social Profiles → Domains → Websites</li>
            <li>• <strong>Análise de Criptomoeda:</strong> Wallet → Transactions → Related Wallets → NFTs</li>
            <li>• <strong>OSINT de Empresa:</strong> Organization → ASNs → CIDR → IPs → Domains → Websites</li>
          </ul>
        </div>
      </section>

      {/* Transforms Disponíveis */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">🔄 Transforms Disponíveis</h2>
        <p className="text-muted-foreground mb-6">
          O RSL-Scarlet possui mais de 30 transforms OSINT prontos para uso, organizados por categoria. 
          Cada transform pode ser usado individualmente ou combinado em flows automatizados.
        </p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <TransformCard
            category="🌐 Domain"
            transforms={[
              'Reverse DNS Resolution - IPs para domínios',
              'DNS Resolution - Domínio para IPs',
              'Subdomain Discovery - Enumerar subdomínios',
              'WHOIS Lookup - Info de registro',
              'Domain to Website - Converter para website',
              'Domain to Root Domain - Extrair domínio raiz',
              'Domain to ASN - ASN associado',
              'Domain History - Histórico de mudanças'
            ]}
          />
          
          <TransformCard
            category="📍 IP Address"
            transforms={[
              'IP Information - Geolocalização e rede',
              'IP to ASN - Encontrar ASN do IP',
              'IP to Domain - Reverse DNS',
              'IP Reputation - Score de reputação',
              'IP to Organization - Dono do IP'
            ]}
          />

          <TransformCard
            category="🏢 ASN & CIDR"
            transforms={[
              'ASN to CIDRs - Blocos IP do ASN',
              'CIDR to IPs - Enumerar IPs do range',
              'ASN Information - Detalhes do ASN',
              'Organization to ASN - ASNs da empresa'
            ]}
          />
          
          <TransformCard
            category="📧 Email"
            transforms={[
              'Email to Gravatar - Buscar perfil Gravatar',
              'Email to Breaches - Verificar vazamentos',
              'Email to Domains - Domínios associados',
              'Email to Social - Perfis de redes sociais',
              'Email Validation - Validar email'
            ]}
          />

          <TransformCard
            category="📱 Phone"
            transforms={[
              'Phone to Breaches - Verificar vazamentos',
              'Phone to Carrier - Identificar operadora',
              'Phone to Location - Localização por código',
              'Phone Validation - Validar número'
            ]}
          />

          <TransformCard
            category="👤 Social Media"
            transforms={[
              'Maigret - Busca em 500+ plataformas',
              'Username Search - Buscar username',
              'Social Profile Enrichment - Enriquecer perfil',
              'Profile to Email - Encontrar emails'
            ]}
          />

          <TransformCard
            category="🏛️ Organization"
            transforms={[
              'Organization to ASN - ASNs da empresa',
              'Organization Information - Dados da empresa',
              'Organization to Domains - Domínios registrados',
              'Organization to People - Funcionários públicos'
            ]}
          />

          <TransformCard
            category="💰 Cryptocurrency"
            transforms={[
              'Wallet to Transactions - Histórico de transações',
              'Wallet to NFTs - NFTs na wallet',
              'Wallet to Balance - Saldo atual',
              'Transaction to Addresses - Endereços envolvidos'
            ]}
          />

          <TransformCard
            category="🌍 Website"
            transforms={[
              'Website Crawler - Mapear estrutura',
              'Website to Links - Extrair links',
              'Website to Domain - Extrair domínio',
              'Website to Webtrackers - Scripts de tracking',
              'Website to Text - Extrair conteúdo',
              'Screenshot - Captura de tela'
            ]}
          />

          <TransformCard
            category="👥 Individual"
            transforms={[
              'Individual to Organization - Vínculos',
              'Individual to Domains - Domínios associados',
              'Individual to Social - Redes sociais',
              'Individual to Email - Emails conhecidos'
            ]}
          />

          <TransformCard
            category="🔗 Integrations"
            transforms={[
              'N8n Connector - Conectar workflows N8n',
              'API Webhook - Chamar APIs externas',
              'Custom Script - Executar scripts Python'
            ]}
          />
        </div>

        <div className="mt-6 bg-[#dc2638]/10 border border-[#dc2638]/30 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-[#dc2638]">💡 Dica:</strong> Combine múltiplos transforms em um Flow 
            para criar pipelines de investigação automatizados. Por exemplo: Domain → IPs → Geolocalização 
            → ASN → Organization para mapear toda a infraestrutura de um alvo.
          </p>
        </div>
      </section>

      {/* Atalhos de Teclado */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">⌨️ Atalhos de Teclado</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <ShortcutItem shortcut="Ctrl + K" description="Abrir busca rápida global (Command Palette)" />
          <ShortcutItem shortcut="Ctrl + N" description="Criar nova investigação rapidamente" />
          <ShortcutItem shortcut="Ctrl + F" description="Buscar dentro da página atual" />
          <ShortcutItem shortcut="Ctrl + S" description="Salvar alterações (investigação/flow)" />
          <ShortcutItem shortcut="Esc" description="Fechar modais, dialogs e painéis" />
          <ShortcutItem shortcut="Del" description="Deletar nó/entidade selecionada no grafo" />
          <ShortcutItem shortcut="Ctrl + Z" description="Desfazer última ação no grafo" />
          <ShortcutItem shortcut="Ctrl + Y" description="Refazer ação desfeita" />
          <ShortcutItem shortcut="Ctrl + A" description="Selecionar todos os nós do grafo" />
          <ShortcutItem shortcut="Ctrl + C" description="Copiar nó selecionado" />
          <ShortcutItem shortcut="Ctrl + V" description="Colar nó copiado" />
          <ShortcutItem shortcut="Ctrl + D" description="Duplicar nó selecionado" />
          <ShortcutItem shortcut="?" description="Mostrar todos os atalhos disponíveis" />
          <ShortcutItem shortcut="/" description="Focar na barra de busca" />
          <ShortcutItem shortcut="Space" description="Iniciar pan/drag no grafo" />
          <ShortcutItem shortcut="+" description="Zoom in no grafo" />
          <ShortcutItem shortcut="-" description="Zoom out no grafo" />
          <ShortcutItem shortcut="0" description="Resetar zoom do grafo" />
        </div>

        <div className="mt-6 bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-[#dc2638]">🎯 Atalhos do Grafo</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Clique simples:</strong> Selecionar nó</li>
            <li>• <strong>Clique duplo:</strong> Editar nó</li>
            <li>• <strong>Botão direito:</strong> Menu de contexto (Run Transform, Delete, etc.)</li>
            <li>• <strong>Shift + Clique:</strong> Selecionar múltiplos nós</li>
            <li>• <strong>Ctrl + Arraste:</strong> Criar seleção em área</li>
            <li>• <strong>Arrastar fundo:</strong> Mover visualização (pan)</li>
            <li>• <strong>Scroll:</strong> Zoom in/out</li>
          </ul>
        </div>
      </section>

      {/* Ética e Legalidade */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Shield className="h-6 w-6 text-[#dc2638]" />
          ⚖️ Ética, Legalidade e Uso Responsável
        </h2>
        
        <div className="bg-[#dc2638]/10 border-2 border-[#dc2638] rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-3 text-[#dc2638]">⚠️ AVISO LEGAL IMPORTANTE</h3>
          <p className="text-muted-foreground mb-3 leading-relaxed">
            O RSL-Scarlet é uma ferramenta profissional de OSINT (Open Source Intelligence) destinada 
            exclusivamente para uso ético e legal. Toda coleta e processamento de dados deve estar em 
            conformidade com as legislações aplicáveis em sua jurisdição.
          </p>
          <p className="text-white font-semibold">
            É de inteira responsabilidade do usuário garantir que suas atividades estejam em conformidade 
            com as leis locais, nacionais e internacionais. A Scarlet Red Solutions não se responsabiliza 
            por uso indevido, ilegal ou antiético da plataforma.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-3 text-[#dc2638]">📜 Legislação Brasileira Aplicável</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <strong className="text-white">Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018):</strong>
                <p className="mt-1">O tratamento de dados pessoais deve respeitar os princípios da finalidade, adequação, necessidade, transparência e segurança. Utilize o RSL-Scarlet apenas com dados públicos ou mediante consentimento legal. Atenção especial aos dados sensíveis (origem racial, convicções religiosas, dados de saúde, etc.) que possuem proteção reforçada.</p>
              </div>
              <div>
                <strong className="text-white">Marco Civil da Internet (Lei 12.965/2014):</strong>
                <p className="mt-1">Estabelece princípios, garantias, direitos e deveres para o uso da Internet no Brasil. Respeite a privacidade, a proteção dos dados pessoais e o direito de acesso à informação. Não utilize a plataforma para invasão de dispositivos ou interceptação de comunicações privadas.</p>
              </div>
              <div>
                <strong className="text-white">Código Penal Brasileiro (Decreto-Lei 2.848/1940):</strong>
                <p className="mt-1">Art. 154-A (Invasão de dispositivo informático), Art. 154-B (Interrupção de serviço), Art. 313-A (Inserção de dados falsos em sistema), Art. 313-B (Modificação de dados). Todas essas práticas são crimes e NÃO devem ser realizadas com esta ferramenta.</p>
              </div>
              <div>
                <strong className="text-white">Lei Carolina Dieckmann (Lei 12.737/2012):</strong>
                <p className="mt-1">Tipifica crimes informáticos. Proíbe invasão de dispositivos, interceptação de comunicações e falsificação de documentos eletrônicos. O RSL-Scarlet deve ser usado apenas para análise de informações públicas e legalmente obtidas.</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3 text-[#dc2638]">🌍 Legislação Internacional Relevante</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <strong className="text-white">GDPR - General Data Protection Regulation (UE):</strong>
                <p className="mt-1">Regulamento europeu que estabelece regras sobre proteção de dados pessoais. Se você processar dados de cidadãos da União Europeia, deve garantir conformidade com princípios de minimização de dados, propósito limitado, e direitos dos titulares (acesso, retificação, exclusão).</p>
              </div>
              <div>
                <strong className="text-white">CFAA - Computer Fraud and Abuse Act (EUA):</strong>
                <p className="mt-1">Lei federal dos EUA que criminaliza acesso não autorizado a sistemas computacionais. Aplica-se a servidores e serviços hospedados nos Estados Unidos. Respeite os termos de serviço de APIs e plataformas consultadas.</p>
              </div>
              <div>
                <strong className="text-white">Convention on Cybercrime (Convenção de Budapeste):</strong>
                <p className="mt-1">Tratado internacional sobre crimes cibernéticos ratificado por diversos países. Estabelece padrões para investigação e cooperação internacional em crimes digitais.</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3 text-[#dc2638]">✅ Casos de Uso LEGAIS e ÉTICOS</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• <strong className="text-white">Due Diligence Corporativa:</strong> Verificação de fornecedores, parceiros comerciais e candidatos a emprego usando informações públicas</li>
              <li>• <strong className="text-white">Investigações Forenses Autorizadas:</strong> Análise de evidências digitais em processos legais com ordem judicial</li>
              <li>• <strong className="text-white">Segurança da Informação:</strong> Mapeamento da superfície de ataque da própria organização (reconhecimento autorizado)</li>
              <li>• <strong className="text-white">Jornalismo Investigativo:</strong> Pesquisa de informações públicas para matérias jornalísticas de interesse público</li>
              <li>• <strong className="text-white">Pesquisa Acadêmica:</strong> Coleta e análise de dados públicos para estudos científicos com aprovação de comitês de ética</li>
              <li>• <strong className="text-white">Threat Intelligence:</strong> Monitoramento de ameaças cibernéticas e indicadores de comprometimento (IoCs)</li>
              <li>• <strong className="text-white">Compliance e Auditoria:</strong> Verificação de conformidade regulatória e exposição de dados corporativos</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3 text-[#dc2638]">❌ Usos PROIBIDOS e ANTIÉTICOS</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• <strong className="text-red-500">Invasão de Privacidade:</strong> Coleta de dados pessoais sem base legal ou consentimento</li>
              <li>• <strong className="text-red-500">Stalking e Perseguição:</strong> Monitoramento não autorizado de indivíduos para fins de assédio</li>
              <li>• <strong className="text-red-500">Fraude e Engenharia Social:</strong> Obtenção de informações mediante engano ou falsidade ideológica</li>
              <li>• <strong className="text-red-500">Acesso Não Autorizado:</strong> Tentativas de invasão de sistemas, redes ou contas de terceiros</li>
              <li>• <strong className="text-red-500">Violação de Termos de Serviço:</strong> Scraping agressivo ou uso de APIs sem autorização</li>
              <li>• <strong className="text-red-500">Discriminação:</strong> Uso de dados para discriminar com base em raça, religião, orientação sexual, etc.</li>
              <li>• <strong className="text-red-500">Doxing:</strong> Exposição maliciosa de informações pessoais com intenção de causar dano</li>
              <li>• <strong className="text-red-500">Espionagem Industrial Ilegal:</strong> Coleta de segredos comerciais sem autorização legal</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3 text-[#dc2638]">📋 Código de Conduta Profissional</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong className="text-white">1. Princípio da Legalidade:</strong> Cumpra todas as leis aplicáveis em sua jurisdição. Em caso de dúvida, consulte assessoria jurídica.</p>
              <p><strong className="text-white">2. Princípio da Necessidade:</strong> Colete apenas os dados estritamente necessários para o objetivo legítimo declarado.</p>
              <p><strong className="text-white">3. Princípio da Proporcionalidade:</strong> O método de coleta deve ser proporcional ao objetivo e não excessivamente invasivo.</p>
              <p><strong className="text-white">4. Princípio da Transparência:</strong> Seja transparente sobre seus propósitos quando legalmente permitido. Documente suas investigações.</p>
              <p><strong className="text-white">5. Princípio da Segurança:</strong> Proteja os dados coletados com medidas adequadas de segurança. Use criptografia e controle de acesso.</p>
              <p><strong className="text-white">6. Princípio da Responsabilidade:</strong> Assuma responsabilidade pelas consequências de suas ações e pelos dados processados.</p>
              <p><strong className="text-white">7. Princípio da Boa-Fé:</strong> Atue sempre com honestidade, integridade e respeito aos direitos fundamentais das pessoas.</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3 text-[#dc2638]">🛡️ Responsabilidade e Isenção</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A Scarlet Red Solutions fornece o RSL-Scarlet "como está" (as-is) para fins legítimos de OSINT. 
              Não nos responsabilizamos por: (1) uso ilegal ou antiético da ferramenta; (2) violação de leis 
              de proteção de dados ou privacidade; (3) danos causados a terceiros; (4) violação de termos de 
              serviço de plataformas de terceiros; (5) interpretação incorreta de dados coletados.
            </p>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Ao utilizar esta plataforma, você concorda em: (1) usar apenas para fins legais; (2) cumprir 
              todas as leis aplicáveis; (3) respeitar os direitos de privacidade; (4) não realizar atividades 
              maliciosas; (5) assumir total responsabilidade por suas ações.
            </p>
          </div>
        </div>

        <div className="mt-6 bg-yellow-500/10 border-2 border-yellow-500/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-yellow-500">📖 Leitura Obrigatória:</strong> Consulte os termos de uso e política de privacidade disponíveis no portal da Scarlet Red Solutions. O uso desta plataforma implica na aceitação de todos os termos e condições estabelecidos.
          </p>
        </div>
      </section>

      {/* Funções dos Módulos do Sistema */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">🧩 Funções Detalhadas dos Módulos</h2>
        <p className="text-muted-foreground mb-6">
          O RSL-Scarlet é composto por 5 módulos principais que trabalham em conjunto para fornecer uma 
          plataforma OSINT completa e escalável. Cada módulo possui responsabilidades bem definidas.
        </p>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#dc2638] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                🖥️
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-[#dc2638]">Interface Web (Frontend)</h3>
                <p className="text-sm text-muted-foreground">Interface do usuário e visualização de dados</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p><strong className="text-white">Responsabilidades:</strong></p>
              <ul className="space-y-1 ml-4">
                <li>• <strong>Visualização de Grafos:</strong> Renderiza grafos interativos usando React Flow. Permite zoom, pan, seleção múltipla e layout automático</li>
                <li>• <strong>Editor de Flows:</strong> Interface drag-and-drop para criar pipelines de transforms. Validação visual de conexões e tipos</li>
                <li>• <strong>Gerenciamento de Investigações:</strong> CRUD completo de investigações, compartilhamento, controle de permissões e exportação</li>
                <li>• <strong>Sistema de Busca (Ctrl+K):</strong> Command palette com busca fuzzy em investigações, flows, transforms e documentação</li>
                <li>• <strong>Interface do Vault:</strong> Gerenciamento de credenciais e secrets com mascaramento de valores sensíveis</li>
                <li>• <strong>Autenticação JWT:</strong> Fluxo de login/registro, armazenamento seguro de tokens, refresh automático</li>
                <li>• <strong>Notificações em Tempo Real:</strong> WebSocket para updates de transforms executando, novos resultados e alertas</li>
                <li>• <strong>Temas e Customização:</strong> Sistema de temas (dark/light), preferências do usuário, layouts salvos</li>
              </ul>
              <p className="mt-3"><strong className="text-white">Tecnologias:</strong> React 18, TypeScript, Vite, TanStack Router, TanStack Query, Zustand, Tailwind CSS, React Flow, Lucide Icons</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#dc2638] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                ⚙️
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-[#dc2638]">API Backend</h3>
                <p className="text-sm text-muted-foreground">Servidor de aplicação e lógica de negócio</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p><strong className="text-white">Responsabilidades:</strong></p>
              <ul className="space-y-1 ml-4">
                <li>• <strong>API RESTful:</strong> Endpoints para todas as operações (investigações, transforms, vault, usuários)</li>
                <li>• <strong>Autenticação e Autorização:</strong> Sistema JWT com roles (admin, user), verificação de permissões por recurso</li>
                <li>• <strong>Gestão de Filas:</strong> Celery workers para execução assíncrona de transforms. Retry automático em falhas</li>
                <li>• <strong>Orquestração de Transforms:</strong> Submissão de tarefas, monitoramento de progresso, coleta de resultados</li>
                <li>• <strong>Persistência de Dados:</strong> Integração com PostgreSQL (dados relacionais) e Neo4j (grafos de entidades)</li>
                <li>• <strong>Sistema de Cofre:</strong> Criptografia AES-256 de secrets, derivação de chaves com PBKDF2, versionamento</li>
                <li>• <strong>Logs e Auditoria:</strong> Registro de todas as ações com timestamp, usuário, tipo de operação e metadados</li>
                <li>• <strong>Validação de Dados:</strong> Pydantic schemas para validação rigorosa de inputs e outputs</li>
                <li>• <strong>Rate Limiting:</strong> Proteção contra abuso com limites por endpoint e por usuário</li>
                <li>• <strong>WebSocket Server:</strong> Comunicação bidirecional para notificações em tempo real</li>
              </ul>
              <p className="mt-3"><strong className="text-white">Tecnologias:</strong> FastAPI, Python 3.11+, SQLAlchemy, Alembic, Celery, Redis, PostgreSQL, Neo4j, Pydantic, cryptography</p>
              <p className="mt-2"><strong className="text-white">Nota de Segurança:</strong> Detalhes de implementação de criptografia, hashing de senhas e validação de tokens são mantidos privados por razões de segurança.</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#dc2638] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                🔧
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-[#dc2638]">Biblioteca Core</h3>
                <p className="text-sm text-muted-foreground">Classes base e funcionalidades compartilhadas</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p><strong className="text-white">Responsabilidades:</strong></p>
              <ul className="space-y-1 ml-4">
                <li>• <strong>Classe Transform Base:</strong> Interface abstrata que todos os transforms devem implementar (execute, validate, required_keys)</li>
                <li>• <strong>Registro de Transforms:</strong> Sistema de descoberta automática de transforms instalados via entry points</li>
                <li>• <strong>Pipeline Executor:</strong> Motor de execução sequencial de transforms com tratamento de erros e propagação de dados</li>
                <li>• <strong>Conectores de Banco:</strong> Wrappers para PostgreSQL e Neo4j com connection pooling e retry logic</li>
                <li>• <strong>Logger Singleton:</strong> Sistema de logging centralizado com níveis configuráveis e rotação de arquivos</li>
                <li>• <strong>Vault Manager:</strong> Interface de alto nível para operações de cofre (get_secret, set_secret, list_secrets)</li>
                <li>• <strong>Exception Handling:</strong> Hierarquia de exceções customizadas para tratamento granular de erros</li>
                <li>• <strong>Data Validators:</strong> Validadores para tipos de entidades (Domain, IP, Email, etc.) com regex e verificações</li>
              </ul>
              <p className="mt-3"><strong className="text-white">Tecnologias:</strong> Python 3.11+, Pydantic, psycopg2, neo4j-driver, structlog</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#dc2638] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                🔄
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-[#dc2638]">Módulo de Transforms OSINT</h3>
                <p className="text-sm text-muted-foreground">Coleção de transforms para coleta e enriquecimento</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p><strong className="text-white">Responsabilidades:</strong></p>
              <ul className="space-y-1 ml-4">
                <li>• <strong>Transforms de Domain:</strong> DNS resolution, WHOIS, subdomain discovery, certificate transparency</li>
                <li>• <strong>Transforms de IP:</strong> Geolocalização, ASN lookup, reputation check, reverse DNS</li>
                <li>• <strong>Transforms de Email:</strong> Breach detection (HaveIBeenPwned), Gravatar, email validation (sintaxe e MX)</li>
                <li>• <strong>Transforms de Phone:</strong> Carrier lookup, número validation, location by area code</li>
                <li>• <strong>Transforms de Crypto:</strong> Blockchain queries (Bitcoin, Ethereum), wallet transactions, NFT lookup</li>
                <li>• <strong>Transforms de Social:</strong> Username search (Maigret), profile enrichment, cross-platform correlation</li>
                <li>• <strong>Transforms de Organization:</strong> ASN discovery, domain ownership, public company info</li>
                <li>• <strong>Transforms de Website:</strong> Crawler, link extractor, screenshot, web tracker detection</li>
                <li>• <strong>Integração com APIs:</strong> Wrappers para Shodan, VirusTotal, Censys, SecurityTrails (requer API keys)</li>
              </ul>
              <p className="mt-3"><strong className="text-white">Tecnologias:</strong> Python 3.11+, aiohttp, dnspython, whois, beautifulsoup4, Pillow, selenium (para screenshots)</p>
              <p className="mt-2"><strong className="text-white">Extensibilidade:</strong> Desenvolvedores podem criar transforms customizados seguindo a interface base. Veja exemplos em <code className="bg-muted px-2 py-1 rounded text-xs">domain/to_ip.py</code></p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#dc2638] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                📦
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-[#dc2638]">Sistema de Tipos</h3>
                <p className="text-sm text-muted-foreground">Schemas e tipos compartilhados</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p><strong className="text-white">Responsabilidades:</strong></p>
              <ul className="space-y-1 ml-4">
                <li>• <strong>Modelos Pydantic:</strong> Schemas de validação para todas as entidades (Domain, IP, Email, Phone, etc.)</li>
                <li>• <strong>Enums e Constantes:</strong> Definições de tipos de entidades, status de transforms, níveis de permissão</li>
                <li>• <strong>DTOs (Data Transfer Objects):</strong> Objetos para comunicação entre frontend e backend (CreateInvestigation, RunTransform)</li>
                <li>• <strong>Validadores de Campo:</strong> Regex patterns para validação de domains, IPs, emails, hashes, wallets</li>
                <li>• <strong>Parsers:</strong> Funções para normalização e extração de dados (parse_domain, parse_ip_address)</li>
                <li>• <strong>Type Hints:</strong> Anotações de tipo para melhor IDE support e type checking com mypy</li>
              </ul>
              <p className="mt-3"><strong className="text-white">Tecnologias:</strong> Python 3.11+, Pydantic, typing-extensions</p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-blue-400">🏗️ Arquitetura Modular:</strong> A separação em módulos permite escalabilidade, manutenibilidade e reutilização de código. Cada módulo pode ser atualizado independentemente, facilitando CI/CD e reduzindo riscos de regressão.
          </p>
        </div>
      </section>

      {/* Segurança e Privacidade */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Shield className="h-6 w-6 text-[#dc2638]" />
          🔒 Segurança e Privacidade
        </h2>
        
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <SecurityItem
            title="Criptografia End-to-End (AES-256)"
            description="Todos os dados sensíveis no Vault são criptografados com AES-256 antes de serem armazenados. As chaves de criptografia são derivadas da sua senha usando PBKDF2 com múltiplas iterações. Apenas você tem acesso às chaves de descriptografia - nem mesmo os administradores do sistema podem acessar seus dados criptografados."
          />
          
          <SecurityItem
            title="Autenticação JWT Segura"
            description="Sistema de autenticação baseado em tokens JWT com tokens de acesso de curta duração (15 minutos) e refresh tokens de longa duração (7 dias). Tokens são assinados com algoritmo RS256 e incluem claims de expiração, emissor e escopo. Suporte a revogação de tokens em caso de comprometimento."
          />
          
          <SecurityItem
            title="Armazenamento Local"
            description="Toda a infraestrutura roda localmente via Docker. Banco de dados PostgreSQL e Neo4j executam em containers isolados. Nenhum dado de investigação é enviado para servidores externos. Você tem controle total sobre backups e migração de dados."
          />

          <SecurityItem
            title="Auditoria Completa"
            description="Todas as ações são registradas com timestamp, usuário responsável, tipo de operação e entidades afetadas. Logs de auditoria incluem: criação/edição/exclusão de investigações, execução de transforms, acesso ao vault, exportação de dados e mudanças de permissões. Rastreabilidade total para compliance."
          />
          
          <SecurityItem
            title="Isolamento de Investigações"
            description="Cada investigação possui controle de acesso independente. Permissões granulares por usuário: Owner (controle total), Editor (editar grafo e executar transforms), Viewer (somente visualização). Compartilhamento explícito via convite. Dados de uma investigação não vazam para outras."
          />

          <SecurityItem
            title="Proteção contra Ataques Comuns"
            description="CORS configurado para aceitar apenas origens confiáveis. Rate limiting em endpoints de autenticação. Proteção CSRF via tokens de sessão. Sanitização de inputs para prevenir SQL Injection e XSS. Headers de segurança (X-Frame-Options, CSP, HSTS) configurados no Nginx."
          />

          <SecurityItem
            title="Gerenciamento Seguro de Credenciais"
            description="API keys e credenciais armazenadas no Vault nunca aparecem em logs. Mascaramento automático em interfaces. Suporte a rotação de credenciais com versionamento. Permissões específicas para leitura/escrita de secrets. Exclusão segura com sobrescrição de dados."
          />

          
          <SecurityItem
            title="Conformidade Legal e Regulatória"
            description="O sistema foi projetado com privacy-by-design e security-by-default. Conformidade com LGPD (Brasil), GDPR (UE) e melhores práticas de segurança da informação. Logs de auditoria permitem demonstrar conformidade em auditorias e processos legais. Todos os dados são armazenados localmente, cumprindo requisitos de data residency e soberania de dados."
          />
        </div>        <div className="mt-6 bg-[#dc2638]/10 border border-[#dc2638]/30 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-[#dc2638]">⚠️ Recomendações de Segurança:</strong>
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
            <li>• Use senhas fortes e únicas (mínimo 12 caracteres, incluindo números e símbolos)</li>
            <li>• Mantenha backups regulares do banco de dados PostgreSQL e Neo4j</li>
            <li>• Atualize o sistema regularmente para patches de segurança</li>
            <li>• Não compartilhe tokens JWT ou session cookies</li>
            <li>• Execute em ambiente isolado (VM ou container dedicado)</li>
            <li>• Configure firewall para bloquear acessos não autorizados</li>
          </ul>
        </div>
      </section>

      {/* Suporte */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Users className="h-6 w-6 text-[#dc2638]" />
          💬 Suporte e Comunidade
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4 text-[#dc2638]">📧 Canal de Suporte</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-[#dc2638] mt-1">•</span>
                <div>
                  <strong className="text-white">Email de Suporte:</strong><br />
                  contato@scarletredsolutions.com
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#dc2638] mt-1">•</span>
                <div>
                  <strong className="text-white">Website:</strong><br />
                  rsl.scarletredsolutions.com
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4 text-[#dc2638]">🛠️ Recursos Técnicos</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-[#dc2638] mt-1">•</span>
                <div>
                  <strong className="text-white">Documentação da API:</strong><br />
                  /api/docs (Swagger UI)
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#dc2638] mt-1">•</span>
                <div>
                  <strong className="text-white">Licenciamento:</strong><br />
                  Software Proprietário - Todos os direitos reservados
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4 text-[#dc2638]">🐛 Reportar Bugs e Sugerir Melhorias</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Encontrou um bug ou tem uma ideia para melhorar o RSL-Scarlet? Entre em contato com nossa equipe de suporte!
          </p>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>1. <strong className="text-white">Entre em contato</strong> via email contato@scarletredsolutions.com</li>
            <li>2. <strong className="text-white">Descreva o problema</strong> com título descritivo e reprodução passo a passo</li>
            <li>3. <strong className="text-white">Inclua logs e screenshots</strong> quando possível</li>
            <li>4. <strong className="text-white">Para melhorias,</strong> descreva o problema que resolve e casos de uso</li>
          </ul>
        </div>

        <div className="mt-6 bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4 text-[#dc2638]">🏢 Licenciamento Corporativo</h3>
          <p className="text-sm text-muted-foreground mb-3">
            O RSL-Scarlet é um software proprietário da Scarlet Red Solutions. Para informações sobre licenciamento corporativo, planos empresariais ou customizações específicas, entre em contato com nossa equipe comercial.
          </p>
          <div className="text-sm text-muted-foreground">
            <strong className="text-white">Opções disponíveis:</strong>
            <ul className="mt-2 space-y-1">
              <li>• Licenças individuais e corporativas</li>
              <li>• Desenvolvimento de transforms customizados</li>
              <li>• Integrações com sistemas legados</li>
              <li>• Suporte técnico dedicado (SLA)</li>
              <li>• Treinamentos e certificações</li>
              <li>• Instâncias privadas em nuvem ou on-premises</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">❓ Perguntas Frequentes (FAQ)</h2>
        
        <div className="space-y-4">
          <FAQItem
            question="Como faço backup dos meus dados?"
            answer="Use 'docker exec' para criar dumps do PostgreSQL e Neo4j. Exemplo: docker exec rsl-postgres pg_dump -U rsl_user rsl_db > backup.sql. Guarde os backups em local seguro e criptografado."
          />
          
          <FAQItem
            question="Posso usar o RSL em ambiente cloud?"
            answer="Sim! Embora projetado para uso local, você pode hospedar em VPS/cloud. Configure firewall, SSL/TLS e autenticação forte. Recomendamos VPN ou acesso via Tailscale para máxima segurança."
          />
          
          <FAQItem
            question="Como adicionar um transform personalizado?"
            answer="Entre em contato com nossa equipe comercial para solicitar o desenvolvimento de transforms customizados. Nossa equipe técnica pode criar transforms específicos para atender às necessidades do seu negócio."
          />
          
          <FAQItem
            question="O sistema funciona offline?"
            answer="Sim, a interface e banco de dados funcionam offline. Porém, transforms que consultam APIs externas (WHOIS, DNS, etc.) requerem conexão com internet."
          />
          
          <FAQItem
            question="Qual a diferença entre Investigation e Flow?"
            answer="Investigation é um caso/projeto contendo um grafo de entidades relacionadas. Flow é um pipeline automatizado de transforms que pode ser executado em qualquer entidade compatível."
          />
          
          <FAQItem
            question="Como rotacionar API keys no Vault?"
            answer="Edite o item no Vault e atualize o valor. O sistema mantém versionamento automático. Para compliance, você pode marcar versões antigas como 'deprecated' sem deletá-las."
          />

          <FAQItem
            question="Como obter acesso ao RSL-Scarlet?"
            answer="O RSL-Scarlet é um software proprietário de acesso restrito. O acesso é concedido exclusivamente mediante contratação de consultoria especializada da Scarlet Red Solutions ou de empresas autorizadas. Não há versão gratuita ou planos de autosserviço. Entre em contato para avaliação de elegibilidade e proposta comercial personalizada."
          />

          <FAQItem
            question="Limite de usuários é configurável?"
            answer="Sim. O limite de usuários depende do plano de licenciamento contratado. Para ambientes corporativos com necessidade de mais usuários, consulte nossa equipe comercial para planos empresariais personalizados."
          />
        </div>
      </section>

      {/* Rodapé */}
      <footer className="mt-16 pt-8 border-t border-border text-center text-sm text-muted-foreground">
        <p>© 2025 Scarlet Red Solutions LTDA. Todos os direitos reservados.</p>
        <p className="mt-2">RSL-Scarlet® v1.0.0 - Red Shadow Link Platform</p>
        <p className="mt-2 text-xs">
          Software Proprietário | Acesso Restrito | Marca Registrada
        </p>
        <p className="mt-1 text-xs">
          Proibido modificação, engenharia reversa ou redistribuição sem autorização expressa
        </p>
        <p className="mt-1 text-xs">
          CNPJ: 57.238.225/0001-06 | <a href="https://scarletredsolutions.com" className="text-[#dc2638] hover:underline" target="_blank" rel="noopener noreferrer">scarletredsolutions.com</a>
        </p>
      </footer>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:border-[#dc2638] transition-colors">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function QuickStartStep({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 bg-[#dc2638] rounded-full flex items-center justify-center text-white font-bold">
        {number}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  )
}

function TransformCard({ category, transforms }: { category: string, transforms: string[] }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="font-semibold mb-3 text-[#dc2638]">{category}</h3>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {transforms.map((transform, idx) => (
          <li key={idx} className="leading-relaxed">• {transform}</li>
        ))}
      </ul>
    </div>
  )
}

function ShortcutItem({ shortcut, description }: { shortcut: string, description: string }) {
  return (
    <div className="flex items-center justify-between bg-card border border-border rounded-lg p-3">
      <span className="text-sm text-muted-foreground">{description}</span>
      <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">{shortcut}</kbd>
    </div>
  )
}

function SecurityItem({ title, description }: { title: string, description: string }) {
  return (
    <div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="font-semibold mb-2 text-white">{question}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
    </div>
  )
}

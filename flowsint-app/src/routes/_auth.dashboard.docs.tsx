import { createFileRoute } from '@tanstack/react-router'
import { BookOpen, Zap, Shield, Database, Workflow, Search, Key, Users } from 'lucide-react'

export const Route = createFileRoute('/_auth/dashboard/docs')({
  component: DocsPage
})

function DocsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#ff4b5c] to-[#d72638] bg-clip-text text-transparent">
          Red Shadow Link (RSL-Scarlet)
        </h1>
        <p className="text-muted-foreground text-lg">
          Plataforma OSINT completa da Scarlet Red Solutions
        </p>
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
            <h3 className="text-lg font-semibold mb-2 text-[#dc2638]">Frontend (flowsint-app)</h3>
            <p className="text-sm text-muted-foreground">
              Interface React + Vite + TypeScript com TanStack Router. Visualização de grafos interativa, 
              editor de flows drag-and-drop, e sistema de busca rápida (Ctrl+K).
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-[#dc2638]">Backend (flowsint-api)</h3>
            <p className="text-sm text-muted-foreground">
              API FastAPI (Python) com autenticação JWT, sistema de filas Celery para processamento 
              assíncrono, e integração com Neo4j (grafos) e PostgreSQL (dados relacionais).
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-[#dc2638]">Core (flowsint-core)</h3>
            <p className="text-sm text-muted-foreground">
              Biblioteca principal contendo classes base de transforms, orquestrador de pipelines, 
              registro de transforms, conectores de banco de dados e sistema de cofre criptografado.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-[#dc2638]">Transforms (flowsint-transforms)</h3>
            <p className="text-sm text-muted-foreground">
              Coleção de mais de 30 transforms OSINT organizados por categoria: Domain, IP, Email, 
              Phone, Crypto, Social Media, Organization e muito mais.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-[#dc2638]">Types (flowsint-types)</h3>
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
            title="Conformidade e Ética"
            description="O RSL-Scarlet é uma ferramenta de uso ético. Consulte o arquivo ETHICS.md no repositório para diretrizes de uso responsável. Não utilize para atividades ilegais, invasão de privacidade ou violação de termos de serviço. Sempre obtenha autorização legal antes de investigações."
          />
        </div>

        <div className="mt-6 bg-[#dc2638]/10 border border-[#dc2638]/30 rounded-lg p-4">
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
            <h3 className="font-semibold mb-4 text-[#dc2638]">📧 Canais de Suporte</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-[#dc2638] mt-1">•</span>
                <div>
                  <strong className="text-white">Email:</strong><br />
                  support@scarletredsolutions.com
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#dc2638] mt-1">•</span>
                <div>
                  <strong className="text-white">GitHub:</strong><br />
                  github.com/LukeCyberWorm/flowsint
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
                  <strong className="text-white">Repositório de Transforms:</strong><br />
                  flowsint-transforms/
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#dc2638] mt-1">•</span>
                <div>
                  <strong className="text-white">Código Fonte:</strong><br />
                  Licença AGPL-3.0 (Open Source)
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4 text-[#dc2638]">🐛 Reportar Bugs e Sugerir Features</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Encontrou um bug ou tem uma ideia para melhorar o RSL-Scarlet? Sua contribuição é bem-vinda!
          </p>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>1. <strong className="text-white">Verifique issues existentes</strong> no GitHub para evitar duplicatas</li>
            <li>2. <strong className="text-white">Crie uma nova issue</strong> com título descritivo e reprodução passo a passo</li>
            <li>3. <strong className="text-white">Inclua logs e screenshots</strong> quando possível</li>
            <li>4. <strong className="text-white">Para features,</strong> descreva o problema que resolve e casos de uso</li>
          </ul>
        </div>

        <div className="mt-6 bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4 text-[#dc2638]">💻 Contribuir com Código</h3>
          <p className="text-sm text-muted-foreground mb-3">
            O RSL-Scarlet é open source (AGPL-3.0). Contribuições via Pull Requests são encorajadas!
          </p>
          <div className="text-sm text-muted-foreground">
            <strong className="text-white">Áreas onde você pode contribuir:</strong>
            <ul className="mt-2 space-y-1">
              <li>• Criar novos transforms OSINT</li>
              <li>• Melhorar visualização do grafo</li>
              <li>• Adicionar integrações com ferramentas externas</li>
              <li>• Corrigir bugs e melhorar performance</li>
              <li>• Escrever testes e documentação</li>
              <li>• Traduzir interface para outros idiomas</li>
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
            answer="Use 'docker exec' para criar dumps do PostgreSQL e Neo4j. Exemplo: docker exec flowsint-postgres-prod pg_dump -U flowsint flowsint > backup.sql. Guarde os backups em local seguro e criptografado."
          />
          
          <FAQItem
            question="Posso usar o RSL em ambiente cloud?"
            answer="Sim! Embora projetado para uso local, você pode hospedar em VPS/cloud. Configure firewall, SSL/TLS e autenticação forte. Recomendamos VPN ou acesso via Tailscale para máxima segurança."
          />
          
          <FAQItem
            question="Como adicionar um transform personalizado?"
            answer="Crie um arquivo .py em flowsint-transforms/src/flowsint_transforms/ herdando de Transform. Implemente os métodos required_keys, execute() e register o transform. Veja exemplos em domain/to_ip.py."
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
            question="O RSL-Scarlet é gratuito?"
            answer="Sim! O código é open source sob licença AGPL-3.0. Você pode usar, modificar e distribuir gratuitamente, mantendo a mesma licença. Suporte comercial está disponível via Scarlet Red Solutions."
          />

          <FAQItem
            question="Limite de 30 usuários é configurável?"
            answer="Sim. O limite está definido no backend (flowsint-api/app/api/). Para ambientes corporativos, o limite pode ser ajustado ou removido via configuração de ambiente."
          />
        </div>
      </section>

      {/* Rodapé */}
      <footer className="mt-16 pt-8 border-t border-border text-center text-sm text-muted-foreground">
        <p>© 2025 Scarlet Red Solutions. Todos os direitos reservados.</p>
        <p className="mt-2">RSL-Scarlet v1.0.0 - Red Shadow Link Platform</p>
        <p className="mt-2 text-xs">
          Built with React + Vite + TypeScript | Backend: FastAPI + PostgreSQL + Neo4j
        </p>
        <p className="mt-1 text-xs">
          Open Source (AGPL-3.0) | <a href="https://github.com/LukeCyberWorm/flowsint" className="text-[#dc2638] hover:underline" target="_blank" rel="noopener noreferrer">GitHub</a>
        </p>
      </footer>
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

import { memo } from 'react'
import { HelpCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'

const InfoDialog = () => {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <div>
            <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs">
              <HelpCircle className="h-3 w-3 opacity-60" />
            </Button>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <div className="p-2">
            <div className="p-2 text-sm space-y-4 overflow-y-auto max-h-[80vh]">
              <h2 className="text-base font-semibold flex items-center gap-2">Sobre o Red Shadow Link</h2>
              <p>
                <strong>Red Shadow Link</strong> é uma{' '}
                <strong>plataforma de investigação e inteligência</strong> criada para dar suporte a fluxos de trabalho complexos
                que envolvem{' '}
                <strong>pessoas, organizações, infraestrutura e atividade online</strong>.
              </p>

              <p>
                Seja conduzindo <strong>investigações cibernéticas</strong>, mapeando{' '}
                <strong>redes de fraude</strong> ou coletando inteligência para{' '}
                <strong>avaliações de ameaça</strong>, o Red Shadow Link ajuda você a coletar, visualizar e
                entender pontos de dados fragmentados de forma estruturada e interativa.
              </p>

              <h3 className="font-semibold">O que o Red Shadow Link faz</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Conecta dados dispersos</strong> — e-mails, domínios, contas em redes sociais, IPs,
                  números de telefone, endereços e muito mais — em um único{' '}
                  <strong>grafo investigativo</strong>.
                </li>
                <li>
                  Oferece <strong>transformações visuais</strong> para navegar de uma entidade para outras relacionadas:
                  encontrar <strong>indivíduos conectados</strong>, descobrir{' '}
                  <strong>infraestrutura</strong> e revelar <strong>aliasses</strong>.
                </li>
                <li>
                  <strong>Acompanha e salva estados da investigação</strong> ao longo do tempo, permitindo
                  explorar múltiplas hipóteses ou revisitar linhas antigas sem perder contexto.
                </li>
                <li>
                  Suporta <strong>enriquecimento dinâmico de dados</strong> a partir de transformações nativas ou personalizadas,
                  trazendo <strong>insights acionáveis</strong> enquanto você explora.
                </li>
              </ul>

              <h3 className="font-semibold">Por que usar o Red Shadow Link?</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Construído para <strong>velocidade e clareza</strong> — renderização rápida de grafos, interface limpa
                  e transformações responsivas.
                </li>
                <li>
                  <strong>Modelo de grafo flexível</strong> que reflete como investigadores pensam — não apenas
                  tabelas e marcadores, mas <strong>relacionamentos</strong>.
                </li>
                <li>
                  Ideal para <strong>analistas individuais e equipes</strong> que precisam se mover rápido, explorar
                  com liberdade e dar sentido a <strong>dados parciais ou desorganizados</strong>.
                </li>
              </ul>

              <h3 className="font-semibold">Casos de uso</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Mapear a <strong>infraestrutura digital</strong> de indivíduos ou organizações
                </li>
                <li>
                  Investigar <strong>esquemas de fraude online</strong> ou{' '}
                  <strong>identidades falsas</strong>
                </li>
                <li>
                  Revelar <strong>ligações entre atores</strong> em múltiplas plataformas
                </li>
                <li>
                  Visualizar o alcance de <strong>dados vazados ou expostos</strong>
                </li>
                <li>
                  Acompanhar o <strong>comportamento de atores de ameaça</strong> em superfícies sociais e técnicas
                </li>
              </ul>

              <p>
                O Red Shadow Link foi projetado para <strong>profissionais</strong> que precisam de{' '}
                <strong>controle total</strong> sobre a lógica de investigação, desde como os dados são
                estruturados até como os relacionamentos são interpretados. Não é apenas uma ferramenta — é um{' '}
                <strong>ambiente flexível</strong> para construir inteligência.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default memo(InfoDialog)

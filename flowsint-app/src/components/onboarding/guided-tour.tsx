import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TourStep {
  target: string
  title: string
  description: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="dashboard"]',
    title: 'Dashboard',
    description: 'Visão geral das suas investigações e estatísticas do sistema. Aqui você acompanha todas as atividades recentes.',
    position: 'right'
  },
  {
    target: '[data-tour="flows"]',
    title: 'Flows',
    description: 'Crie e gerencie fluxos de investigação automatizados. Combine diferentes transforms para processar dados OSINT.',
    position: 'right'
  },
  {
    target: '[data-tour="investigations"]',
    title: 'Investigações',
    description: 'Gerencie todas as suas investigações ativas. Organize casos, adicione notas e compartilhe com sua equipe.',
    position: 'right'
  },
  {
    target: '[data-tour="vault"]',
    title: 'Cofre',
    description: 'Armazene credenciais e informações sensíveis de forma segura com criptografia de ponta a ponta.',
    position: 'right'
  },
  {
    target: '[data-tour="search"]',
    title: 'Busca Rápida',
    description: 'Use Ctrl+K ou Cmd+K para abrir a busca rápida e navegar pelo sistema instantaneamente.',
    position: 'bottom'
  },
  {
    target: '[data-tour="docs"]',
    title: 'Documentação',
    description: 'Acesse a documentação completa do sistema RSL-Scarlet com guias, tutoriais e referências da API.',
    position: 'right'
  }
]

export function GuidedTour() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    // Verificar se é o primeiro login
    const hasSeenTour = localStorage.getItem('rsl-tour-completed')
    if (!hasSeenTour) {
      setTimeout(() => setIsOpen(true), 1000)
    }
  }, [])

  useEffect(() => {
    if (isOpen && tourSteps[currentStep]) {
      const element = document.querySelector(tourSteps[currentStep].target) as HTMLElement
      setTargetElement(element)
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [isOpen, currentStep])

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    localStorage.setItem('rsl-tour-completed', 'true')
    setIsOpen(false)
  }

  const handleComplete = () => {
    localStorage.setItem('rsl-tour-completed', 'true')
    setIsOpen(false)
  }

  if (!isOpen || !targetElement) return null

  const step = tourSteps[currentStep]
  const rect = targetElement.getBoundingClientRect()
  
  const getTooltipPosition = () => {
    const offset = 20
    switch (step.position) {
      case 'right':
        return {
          top: rect.top + rect.height / 2,
          left: rect.right + offset,
          transform: 'translateY(-50%)'
        }
      case 'left':
        return {
          top: rect.top + rect.height / 2,
          right: window.innerWidth - rect.left + offset,
          transform: 'translateY(-50%)'
        }
      case 'top':
        return {
          bottom: window.innerHeight - rect.top + offset,
          left: rect.left + rect.width / 2,
          transform: 'translateX(-50%)'
        }
      case 'bottom':
        return {
          top: rect.bottom + offset,
          left: rect.left + rect.width / 2,
          transform: 'translateX(-50%)'
        }
    }
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9998]" style={{ backgroundColor: 'rgba(220, 38, 56, 0.3)' }} />
      
      {/* Spotlight */}
      <div 
        className="fixed z-[9999] pointer-events-none"
        style={{
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
          boxShadow: '0 0 0 9999px rgba(220, 38, 56, 0.3)',
          borderRadius: '8px',
          border: '2px solid #dc2638',
          transition: 'all 0.3s ease'
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed z-[10000] bg-background border-2 border-[#dc2638] rounded-lg shadow-xl p-6 max-w-sm"
        style={getTooltipPosition()}
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-[#dc2638]">{step.title}</h3>
          <button
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-6">
          {step.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {currentStep + 1} de {tourSteps.length}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-xs"
            >
              Pular tour
            </Button>
            <Button
              size="sm"
              onClick={handleNext}
              className="bg-[#dc2638] hover:bg-[#c01f2f] text-xs"
            >
              {currentStep < tourSteps.length - 1 ? 'Próximo' : 'Finalizar'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

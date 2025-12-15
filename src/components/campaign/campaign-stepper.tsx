import { motion } from 'framer-motion'
import { Check, Circle, Target, Users, Gift, Palette, ClipboardCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CampaignStep } from '@/types'

interface CampaignStepperProps {
  currentStep: CampaignStep
  onStepClick?: (step: CampaignStep) => void
  completedSteps?: CampaignStep[]
}

const steps: { id: CampaignStep; label: string; icon: typeof Target }[] = [
  { id: 'context', label: 'Context', icon: Target },
  { id: 'audience', label: 'Audience', icon: Users },
  { id: 'offer', label: 'Offer', icon: Gift },
  { id: 'creative', label: 'Creative', icon: Palette },
  { id: 'review', label: 'Review', icon: ClipboardCheck },
]

export function CampaignStepper({ currentStep, onStepClick, completedSteps = [] }: CampaignStepperProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep)

  return (
    <div className="bg-surface border-b border-border px-8 py-4">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id) || index < currentIndex
          const isCurrent = step.id === currentStep
          const isClickable = isCompleted || index <= currentIndex

          return (
            <div key={step.id} className="flex items-center">
              {/* Step */}
              <button
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={cn(
                  'flex items-center gap-3 transition-all duration-200',
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                )}
              >
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    backgroundColor: isCompleted 
                      ? 'var(--color-success)' 
                      : isCurrent 
                        ? 'var(--color-primary)' 
                        : 'var(--color-surface-tertiary)'
                  }}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                    isCompleted || isCurrent ? 'text-white' : 'text-text-muted'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : isCurrent ? (
                    <step.icon className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </motion.div>
                <span
                  className={cn(
                    'text-sm font-medium hidden sm:block',
                    isCurrent ? 'text-primary' : isCompleted ? 'text-text-primary' : 'text-text-muted'
                  )}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="w-12 lg:w-24 mx-4 h-0.5 bg-border relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    className="absolute inset-0 bg-success"
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

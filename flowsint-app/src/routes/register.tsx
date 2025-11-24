// src/routes/register.tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import { useRegister } from '@/hooks/use-auth'
import { useForm, FormProvider } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import FormField from '@/components/shared/form-field'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/register')({
  component: Register
})

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'O nome de usuário deve ter pelo menos 3 caracteres')
      .max(50, 'O nome de usuário deve ter no máximo 50 caracteres'),
    email: z.string().email('Informe um e-mail válido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword']
  })

type RegisterFormValues = z.infer<typeof registerSchema>

function Register() {
  const methods = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  const registerMutation = useRegister()

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const { confirmPassword, ...registerData } = data
      await registerMutation.mutateAsync(registerData)
    } catch (error) {
      console.error("Erreur d'inscription:", error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <img
            src="/rsl-logo.svg"
            alt="RSL - Scarlet"
            className="mx-auto h-24 w-auto"
          />
          <h1 className="text-3xl font-extrabold tracking-wide">RSL - Scarlet</h1>
          <p className="text-sm text-gray-300">
            Crie sua conta e inicie período de avaliação gratuito
          </p>
          <p className="text-xs text-gray-400 uppercase tracking-[0.3em]">
            By Scarlet Red Solutions
          </p>
          
          {/* Trial Notice */}
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
            <p className="text-sm text-blue-200 mb-2">
              <span className="font-semibold">🎁 5 dias de avaliação gratuita</span>
            </p>
            <p className="text-xs text-blue-300/80 leading-relaxed">
              Explore todas as funcionalidades do RSL-Scarlet por 5 dias. 
              Após este período, entre em contato para adquirir uma licença permanente.
            </p>
          </div>
        </div>

        <FormProvider {...methods}>
          <form className="mt-8 space-y-6" onSubmit={methods.handleSubmit(onSubmit)}>
            {registerMutation.error && (
              <div className="p-3 mb-4 text-sm bg-red-500/10 border border-red-400 text-red-300 rounded">
                {registerMutation.error instanceof Error
                  ? registerMutation.error.message
                  : 'Não foi possível concluir o cadastro. Tente novamente.'}
              </div>
            )}

            <div className="rounded-md shadow-sm space-y-4">
              <FormField name="username" label="Nome de usuário" placeholder="Escolha um nome" autoComplete="username" />
              <FormField name="email" label="E-mail" type="email" placeholder="Seu e-mail" autoComplete="email" />
              <FormField name="password" label="Senha" type="password" placeholder="Crie uma senha" autoComplete="new-password" />
              <FormField
                name="confirmPassword"
                label="Confirme a senha"
                type="password"
                placeholder="Repita a senha"
                autoComplete="new-password"
              />
            </div>

            <div>
              <Button
                type="submit"
                disabled={registerMutation.isPending || methods.formState.isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                {registerMutation.isPending || methods.formState.isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                           5.291A7.962 7.962 0 014 12H0c0 
                           3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Cadastrando...
                  </span>
                ) : (
                  'Cadastrar'
                )}
              </Button>
            </div>
          </form>
        </FormProvider>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-300">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-medium text-primary underline">
              Acesse aqui
            </Link>
          </p>
        </div>
      </div>

      <p className="mt-12 text-center text-xs text-gray-500">
        CNPJ: 57.238.225/0001-06 — Scarlet Red Solutions LTDA
      </p>
    </div>
  )
}

export default Register

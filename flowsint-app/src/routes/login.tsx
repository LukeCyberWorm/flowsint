import { Link } from '@tanstack/react-router'
import { useLogin } from '@/hooks/use-auth'
import { FormProvider, useForm } from 'react-hook-form'
import FormField from '@/components/shared/form-field'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: Login
})

const loginSchema = z.object({
  username: z.string().min(1, 'Informe seu e-mail'),
  password: z.string().min(1, 'Informe sua senha'),
  rememberMe: z.boolean().optional()
})

type LoginFormValues = z.infer<typeof loginSchema>

function Login() {
  // Initialize React Hook Form
  const methods = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false
    }
  })

  const login = useLogin()

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login.mutateAsync({
        username: data.username,
        password: data.password
      })
    } catch (error) {
      console.error('Login error:', error)
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
            Seja bem-vindo ao sistema OSINT Red Shadow Link
          </p>
          <p className="text-xs text-gray-400 uppercase tracking-[0.3em]">
            By Scarlet Red Solutions
          </p>
        </div>

        <FormProvider {...methods}>
          <form className="mt-8 space-y-6" onSubmit={methods.handleSubmit(onSubmit)}>
            {/* Display login error */}
            {login.error && (
              <div className="p-3 mb-4 text-sm bg-red-500/10 border border-red-400 text-red-300 rounded">
                {login.error instanceof Error ? login.error.message : 'Não foi possível entrar. Tente novamente.'}
              </div>
            )}

            <div className="rounded-md space-y-4">
              {/* Username field */}
              <FormField
                name="username"
                label="E-mail"
                placeholder="Seu e-mail"
                disabled={login.isPending}
              />

              {/* Password field */}
              <FormField
                name="password"
                label="Senha"
                type="password"
                placeholder="Sua senha"
                disabled={login.isPending}
              />
            </div>

            {/* Additional options */}
            {/* <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  {...methods.register('rememberMe')}
                  type="checkbox"
                  className="h-4 w-4 text-primary rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary">
                  Forgot your password?
                </a>
              </div>
            </div> */}

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={login.isPending || methods.formState.isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                {login.isPending || methods.formState.isSubmitting ? (
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
          </form>
        </FormProvider>

        {/* Link to registration */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-300">
            Ainda não tem uma conta?{' '}
            <Link to="/register" className="font-medium text-primary">
              Cadastre-se
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

export default Login

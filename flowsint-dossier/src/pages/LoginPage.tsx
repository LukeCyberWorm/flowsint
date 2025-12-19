import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, FileText } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const [accessToken, setAccessToken] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Navega para a página do dossiê
      // A validação será feita na página de visualização
      const url = `/dossier/${accessToken}${password ? `?password=${encodeURIComponent(password)}` : ''}`
      navigate(url)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao acessar dossiê')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-scarlet-600 to-scarlet-800 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4"
            >
              <FileText className="w-10 h-10 text-scarlet-600" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Dossiê de Caso
            </h1>
            <p className="text-scarlet-100">
              Scarlet Red Solutions
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token de Acesso
                </label>
                <input
                  type="text"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Digite o token fornecido"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scarlet-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha (opcional)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Se necessário"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scarlet-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || !accessToken}
                className="w-full bg-gradient-to-r from-scarlet-600 to-scarlet-700 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Acessando...' : 'Acessar Dossiê'}
              </motion.button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Precisa de ajuda?</p>
              <a
                href="mailto:contato@scarletredsolutions.com"
                className="text-scarlet-600 hover:text-scarlet-700 font-medium"
              >
                contato@scarletredsolutions.com
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

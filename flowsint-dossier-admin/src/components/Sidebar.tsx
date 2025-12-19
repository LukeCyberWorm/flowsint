import { Link, useLocation } from 'react-router-dom'
import { Home, FileText, Settings, PlusCircle } from 'lucide-react'

export default function Sidebar() {
  const location = useLocation()

  const links = [
    { to: '/', label: 'Dashboard', icon: Home },
    { to: '/dossiers', label: 'Dossiês', icon: FileText },
    { to: '/dossiers/new', label: 'Novo Dossiê', icon: PlusCircle },
  ]

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">Admin Dossiê</h1>
        <p className="text-sm text-gray-400 mt-1">Scarlet Red Solutions</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = location.pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-scarlet-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

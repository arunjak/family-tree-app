import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface NavbarProps {
  title?: string
  showBack?: boolean
}

export default function Navbar({ title = '🌳 Family Tree', showBack = false }: NavbarProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-[#0053e2] text-white px-6 py-4 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => navigate('/dashboard')}
            className="text-white/80 hover:text-white transition text-sm flex items-center gap-1"
            aria-label="Back to dashboard"
          >
            ← Back
          </button>
        )}
        <span className="text-xl font-bold">{title}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm opacity-80 hidden sm:block">Hi, {user?.name}</span>
        <button
          onClick={handleLogout}
          className="text-sm bg-white text-[#0053e2] px-3 py-1.5 rounded-lg font-medium hover:bg-blue-50 transition"
        >
          Sign Out
        </button>
      </div>
    </nav>
  )
}

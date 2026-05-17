import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTrees, createTree } from '@/api/trees'
import { useAuthStore } from '@/store/authStore'
import type { FamilyTree } from '@/types'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [trees, setTrees] = useState<FamilyTree[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')

  useEffect(() => {
    getTrees()
      .then((r) => setTrees(r.data))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    const { data } = await createTree(newName.trim(), newDesc.trim() || undefined)
    setTrees((prev) => [...prev, data])
    setShowCreate(false)
    setNewName('')
    setNewDesc('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-[#0053e2] text-white px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold">🌳 Family Tree</span>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-80">Hi, {user?.name}</span>
          <button
            onClick={logout}
            className="text-sm bg-white text-[#0053e2] px-3 py-1.5 rounded-lg font-medium hover:bg-blue-50 transition"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">My Family Trees</h2>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#0053e2] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            + New Tree
          </button>
        </div>

        {/* Create Tree Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Create Family Tree</h3>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-[#0053e2]"
                placeholder="Tree name (e.g. Smith Family)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <textarea
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-[#0053e2]"
                placeholder="Description (optional)"
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleCreate}
                  className="flex-1 bg-[#0053e2] text-white py-2.5 rounded-lg font-medium hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 border border-gray-300 py-2.5 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Trees Grid */}
        {loading ? (
          <p className="text-gray-500">Loading your trees...</p>
        ) : trees.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🌳</p>
            <p className="text-lg">No family trees yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trees.map((tree) => (
              <button
                key={tree.id}
                onClick={() => navigate(`/trees/${tree.id}`)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:shadow-md hover:border-[#0053e2] transition"
              >
                <p className="text-2xl mb-3">🌳</p>
                <h3 className="font-bold text-gray-800 text-lg">{tree.name}</h3>
                {tree.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{tree.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-3">
                  Created {new Date(tree.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

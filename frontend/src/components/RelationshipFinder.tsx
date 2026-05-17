import { useState } from 'react'
import { findPath } from '@/api/persons'
import type { Person, RelationshipPath } from '@/types'

interface Props {
  treeId: number
  persons: Person[]
}

export default function RelationshipFinder({ treeId, persons }: Props) {
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [result, setResult] = useState<RelationshipPath | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const personName = (p: Person) => `${p.firstName} ${p.lastName ?? ''}`.trim()

  const handleFind = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fromId || !toId) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const { data } = await findPath(treeId, Number(fromId), Number(toId))
      setResult(data)
    } catch {
      setError('Could not find path. Try different people.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        🔍 Relationship Finder
      </h3>

      <form onSubmit={handleFind} className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1">
          <label className="label">Person A</label>
          <select className="input" value={fromId} onChange={(e) => setFromId(e.target.value)} required>
            <option value="">Select person...</option>
            {persons.map((p) => (
              <option key={p.id} value={p.id}>{personName(p)}</option>
            ))}
          </select>
        </div>

        <div className="text-gray-400 pb-2 hidden sm:block">↔</div>

        <div className="flex-1">
          <label className="label">Person B</label>
          <select
            className="input"
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            required
          >
            <option value="">Select person...</option>
            {persons
              .filter((p) => p.id.toString() !== fromId)
              .map((p) => (
                <option key={p.id} value={p.id}>{personName(p)}</option>
              ))}
          </select>
        </div>

        <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
          {loading ? 'Finding...' : 'Find Relation'}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
          {result.path.length === 0 ? (
            <p className="text-gray-500 italic text-sm">No connection found between these two people.</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-[#0053e2] mb-3">{result.description}</p>
              <div className="flex flex-wrap items-center gap-2">
                {result.path.map((person, idx) => (
                  <div key={person.id} className="flex items-center gap-2">
                    <div className="bg-[#0053e2] text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-sm">
                      {person.firstName[0]}{person.lastName?.[0] ?? ''}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {person.firstName} {person.lastName ?? ''}
                    </span>
                    {idx < result.path.length - 1 && (
                      <span className="text-gray-400">→</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

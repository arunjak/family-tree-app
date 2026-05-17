import { useState } from 'react'
import type { Person, RelationType } from '@/types'

interface Props {
  persons: Person[]
  preselectedId?: number | null
  onSave: (personId: number, relatedPersonId: number, relationType: RelationType) => Promise<void>
  onClose: () => void
}

const RELATION_TYPES: { value: RelationType; label: string; emoji: string }[] = [
  { value: 'PARENT',  label: 'Parent of',  emoji: '👨‍👧' },
  { value: 'CHILD',   label: 'Child of',   emoji: '👶' },
  { value: 'SPOUSE',  label: 'Spouse of',  emoji: '💑' },
  { value: 'SIBLING', label: 'Sibling of', emoji: '👫' },
]

export default function RelationshipModal({ persons, preselectedId, onSave, onClose }: Props) {
  const [personId, setPersonId] = useState<string>(preselectedId?.toString() ?? '')
  const [relatedId, setRelatedId] = useState<string>('')
  const [relationType, setRelationType] = useState<RelationType>('PARENT')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!personId || !relatedId) return
    if (personId === relatedId) {
      setError('Cannot link a person to themselves!')
      return
    }
    setError('')
    setSaving(true)
    try {
      await onSave(Number(personId), Number(relatedId), relationType)
      onClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Failed to save relationship.')
    } finally {
      setSaving(false)
    }
  }

  const personName = (p: Person) => `${p.firstName} ${p.lastName ?? ''}`.trim()

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-5">Add Relationship</h2>

          {error && (
            <p className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-4 py-2 text-sm mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Person A</label>
              <select className="input" value={personId} onChange={(e) => setPersonId(e.target.value)} required>
                <option value="">Select a person...</option>
                {persons.map((p) => (
                  <option key={p.id} value={p.id}>{personName(p)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Relationship</label>
              <div className="grid grid-cols-2 gap-2">
                {RELATION_TYPES.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRelationType(value)}
                    className={`border rounded-lg py-2 px-3 text-sm font-medium transition ${
                      relationType === value
                        ? 'bg-[#0053e2] text-white border-[#0053e2]'
                        : 'border-gray-300 text-gray-700 hover:border-[#0053e2]'
                    }`}
                  >
                    {emoji} {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Person B</label>
              <select className="input" value={relatedId} onChange={(e) => setRelatedId(e.target.value)} required>
                <option value="">Select a person...</option>
                {persons
                  .filter((p) => p.id.toString() !== personId)
                  .map((p) => (
                    <option key={p.id} value={p.id}>{personName(p)}</option>
                  ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving...' : 'Add Relationship'}
              </button>
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

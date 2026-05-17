import React, { useEffect, useState } from 'react'
import type { Person, Gender } from '@/types'

interface Props {
  treeId: number
  person?: Person | null
  onSave: (data: Partial<Person>) => Promise<void>
  onClose: () => void
}

const GENDERS: Gender[] = ['MALE', 'FEMALE', 'OTHER']

const emptyForm = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  dateOfDeath: '',
  gender: '' as Gender | '',
  bio: '',
}

export default function PersonModal({ person, onSave, onClose }: Props) {
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (person) {
      setForm({
        firstName: person.firstName ?? '',
        lastName: person.lastName ?? '',
        dateOfBirth: person.dateOfBirth ?? '',
        dateOfDeath: person.dateOfDeath ?? '',
        gender: person.gender ?? '',
        bio: person.bio ?? '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [person])

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await onSave({
        firstName: form.firstName,
        lastName: form.lastName || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        dateOfDeath: form.dateOfDeath || undefined,
        gender: (form.gender as Gender) || undefined,
        bio: form.bio || undefined,
      })
      onClose()
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-5">
            {person ? 'Edit Person' : 'Add Person'}
          </h2>

          {error && (
            <p className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-4 py-2 text-sm mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First Name *</label>
                <input className="input" required value={form.firstName} onChange={set('firstName')} placeholder="John" />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input className="input" value={form.lastName} onChange={set('lastName')} placeholder="Smith" />
              </div>
            </div>

            <div>
              <label className="label">Gender</label>
              <select className="input" value={form.gender} onChange={set('gender')}>
                <option value="">Select gender</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g.charAt(0) + g.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Date of Birth</label>
                <input className="input" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
              </div>
              <div>
                <label className="label">Date of Death</label>
                <input className="input" type="date" value={form.dateOfDeath} onChange={set('dateOfDeath')} />
              </div>
            </div>

            <div>
              <label className="label">Bio</label>
              <textarea
                className="input resize-none"
                rows={3}
                value={form.bio}
                onChange={set('bio')}
                placeholder="A short biography..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving...' : person ? 'Update' : 'Add Person'}
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

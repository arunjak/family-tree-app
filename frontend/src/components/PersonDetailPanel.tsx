import type { Person, Relationship } from '@/types'

interface Props {
  person: Person
  relationships: Relationship[]
  allPersons: Person[]
  onEdit: (p: Person) => void
  onDelete: (p: Person) => void
  onDeleteRelationship: (relationshipId: number) => void
  onAddRelationship: (personId: number) => void
  onClose: () => void
}

const RELATION_EMOJI: Record<string, string> = {
  PARENT: '👨‍👧', CHILD: '👶', SPOUSE: '💑', SIBLING: '👫',
}

export default function PersonDetailPanel({
  person,
  relationships,
  allPersons,
  onEdit,
  onDelete,
  onDeleteRelationship,
  onAddRelationship,
  onClose,
}: Props) {
  const personName = (p: Person) => `${p.firstName} ${p.lastName ?? ''}`.trim()

  const myRelationships = relationships.filter(
    (r) => r.personId === person.id || r.relatedPersonId === person.id
  )

  const findPerson = (id: number) => allPersons.find((p) => p.id === id)

  const fullName = personName(person)
  const isAlive = !person.dateOfDeath

  return (
    <aside className="w-72 bg-white border-l border-gray-200 flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-800 truncate">{fullName}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition text-lg leading-none" aria-label="Close panel">✕</button>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center py-5 bg-gray-50 border-b border-gray-100">
        <div className="w-20 h-20 rounded-full bg-[#0053e2] flex items-center justify-center text-white text-2xl font-bold shadow">
          {person.firstName[0]}{person.lastName?.[0] ?? ''}
        </div>
        {person.gender && (
          <span className="mt-2 text-xs text-gray-500 uppercase tracking-wide">{person.gender.toLowerCase()}</span>
        )}
        {!isAlive && (
          <span className="mt-1 text-xs text-gray-400 italic">† Deceased</span>
        )}
      </div>

      {/* Details */}
      <div className="px-4 py-4 space-y-3 border-b border-gray-100">
        {person.dateOfBirth && (
          <DetailRow label="Born" value={new Date(person.dateOfBirth).toLocaleDateString()} />
        )}
        {person.dateOfDeath && (
          <DetailRow label="Died" value={new Date(person.dateOfDeath).toLocaleDateString()} />
        )}
        {person.bio && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Bio</p>
            <p className="text-sm text-gray-600 leading-relaxed">{person.bio}</p>
          </div>
        )}
      </div>

      {/* Relationships */}
      <div className="px-4 py-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Relationships</p>
          <button
            onClick={() => onAddRelationship(person.id)}
            className="text-xs text-[#0053e2] hover:underline font-medium"
          >
            + Add
          </button>
        </div>

        {myRelationships.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No relationships yet</p>
        ) : (
          <ul className="space-y-2">
            {myRelationships.map((r) => {
              const otherId = r.personId === person.id ? r.relatedPersonId : r.personId
              const other = findPerson(otherId)
              return (
                <li key={r.id} className="flex items-center gap-2 text-sm text-gray-700 group">
                  <span className="text-base">{RELATION_EMOJI[r.relationType] ?? '🔗'}</span>
                  <span className="font-medium capitalize flex-1">{r.relationType.toLowerCase()}</span>
                  <span className="text-gray-500 flex-1 truncate">of {other ? personName(other) : '?'}</span>
                  <button
                    onClick={() => onDeleteRelationship(r.id)}
                    title="Remove relationship"
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity text-base leading-none ml-1"
                  >
                    ✕
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-4 border-t border-gray-100 flex gap-2">
        <button onClick={() => onEdit(person)} className="btn-secondary flex-1 text-sm">
          ✏️ Edit
        </button>
        <button
          onClick={() => onDelete(person)}
          className="flex-1 text-sm border border-red-300 text-red-600 rounded-lg py-2 hover:bg-red-50 transition"
        >
          🗑️ Delete
        </button>
      </div>
    </aside>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-700 font-medium">{value}</p>
    </div>
  )
}

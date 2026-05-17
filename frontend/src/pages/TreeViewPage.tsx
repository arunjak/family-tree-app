import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTree } from '@/api/trees'
import {
  getPersons, createPerson, updatePerson, deletePerson,
  getRelationships, createRelationship, deleteRelationship,
} from '@/api/persons'
import type { FamilyTree, Person, Relationship, RelationType } from '@/types'
import Navbar from '@/components/Navbar'
import FamilyTreeGraph from '@/components/FamilyTreeGraph'
import PersonModal from '@/components/PersonModal'
import RelationshipModal from '@/components/RelationshipModal'
import PersonDetailPanel from '@/components/PersonDetailPanel'
import RelationshipFinder from '@/components/RelationshipFinder'

type ModalState = 'none' | 'addPerson' | 'editPerson' | 'addRelationship'

export default function TreeViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const treeId = Number(id)

  const [tree, setTree] = useState<FamilyTree | null>(null)
  const [persons, setPersons] = useState<Person[]>([])
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [modal, setModal] = useState<ModalState>('none')
  const [preselectedForRelation, setPreselectedForRelation] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'graph' | 'list' | 'finder'>('graph')

  useEffect(() => {
    if (!treeId) { navigate('/dashboard'); return }
    Promise.all([getTree(treeId), getPersons(treeId), getRelationships(treeId)])
      .then(([t, p, r]) => {
        setTree(t.data)
        setPersons(p.data)
        setRelationships(r.data)
      })
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false))
  }, [treeId, navigate])

  const handleSelectPerson = useCallback((p: Person) => {
    setSelectedPerson((prev) => (prev?.id === p.id ? null : p))
  }, [])

  const handleSavePerson = async (data: Partial<Person>) => {
    if (editingPerson) {
      const res = await updatePerson(treeId, editingPerson.id, data)
      setPersons((prev) => prev.map((p) => (p.id === editingPerson.id ? res.data : p)))
      if (selectedPerson?.id === editingPerson.id) setSelectedPerson(res.data)
    } else {
      const res = await createPerson(treeId, data)
      setPersons((prev) => [...prev, res.data])
    }
    setEditingPerson(null)
  }

  const handleDeletePerson = async (person: Person) => {
    if (!confirm(`Remove ${person.firstName} from the tree?`)) return
    await deletePerson(treeId, person.id)
    setPersons((prev) => prev.filter((p) => p.id !== person.id))
    setRelationships((prev) => prev.filter(
      (r) => r.personId !== person.id && r.relatedPersonId !== person.id
    ))
    if (selectedPerson?.id === person.id) setSelectedPerson(null)
  }

  const handleSaveRelationship = async (
    personId: number, relatedPersonId: number, relationType: RelationType
  ) => {
    const res = await createRelationship(treeId, { personId, relatedPersonId, relationType })
    setRelationships((prev) => [...prev, res.data])
  }

  const handleDeleteRelationship = async (relationshipId: number) => {
    await deleteRelationship(treeId, relationshipId)
    setRelationships((prev) => prev.filter((r) => r.id !== relationshipId))
  }

  const openAddRelationship = (personId: number) => {
    setPreselectedForRelation(personId)
    setModal('addRelationship')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-lg">Loading tree...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar title={`🌳 ${tree?.name ?? 'Family Tree'}`} showBack />

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(['graph', 'list', 'finder'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm font-medium transition ${
                activeTab === tab
                  ? 'bg-[#0053e2] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab === 'graph' ? '🌳 Tree' : tab === 'list' ? '👥 Members' : '🔍 Finder'}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          <button
            onClick={() => { setEditingPerson(null); setModal('addPerson') }}
            className="btn-primary text-sm"
          >
            + Add Person
          </button>
          <button
            onClick={() => { setPreselectedForRelation(null); setModal('addRelationship') }}
            disabled={persons.length < 2}
            className="btn-secondary text-sm disabled:opacity-40"
          >
            + Link People
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
        {/* Main panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'graph' && (
            <FamilyTreeGraph
              persons={persons}
              relationships={relationships}
              selectedId={selectedPerson?.id ?? null}
              onSelectPerson={handleSelectPerson}
            />
          )}

          {activeTab === 'list' && (
            <div className="flex-1 overflow-y-auto p-6">
              <h2 className="text-lg font-bold text-gray-700 mb-4">
                Family Members ({persons.length})
              </h2>
              {persons.length === 0 ? (
                <p className="text-gray-400 italic">No members yet. Add someone!</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {persons.map((p) => (
                    <PersonCard
                      key={p.id}
                      person={p}
                      onEdit={() => { setEditingPerson(p); setModal('editPerson') }}
                      onDelete={() => handleDeletePerson(p)}
                      onClick={() => { setSelectedPerson(p); setActiveTab('graph') }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'finder' && (
            <div className="flex-1 overflow-y-auto p-6">
              <RelationshipFinder treeId={treeId} persons={persons} />
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedPerson && activeTab === 'graph' && (
          <PersonDetailPanel
            person={selectedPerson}
            relationships={relationships}
            allPersons={persons}
            onEdit={(p) => { setEditingPerson(p); setModal('editPerson') }}
            onDelete={handleDeletePerson}
            onAddRelationship={openAddRelationship}
            onClose={() => setSelectedPerson(null)}
          />
        )}
      </div>

      {/* Modals */}
      {(modal === 'addPerson' || modal === 'editPerson') && (
        <PersonModal
          treeId={treeId}
          person={editingPerson}
          onSave={handleSavePerson}
          onClose={() => { setModal('none'); setEditingPerson(null) }}
        />
      )}

      {modal === 'addRelationship' && (
        <RelationshipModal
          persons={persons}
          preselectedId={preselectedForRelation}
          onSave={handleSaveRelationship}
          onClose={() => { setModal('none'); setPreselectedForRelation(null) }}
        />
      )}
    </div>
  )
}

function PersonCard({
  person,
  onEdit,
  onDelete,
  onClick,
}: {
  person: Person
  onEdit: () => void
  onDelete: () => void
  onClick: () => void
}) {
  const fullName = `${person.firstName} ${person.lastName ?? ''}`.trim()
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-[#0053e2] transition cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-[#0053e2] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
          {person.firstName[0]}{person.lastName?.[0] ?? ''}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 truncate">{fullName}</p>
          {person.dateOfBirth && (
            <p className="text-xs text-gray-400">
              b. {new Date(person.dateOfBirth).getFullYear()}
              {person.dateOfDeath && ` – ${new Date(person.dateOfDeath).getFullYear()}`}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
        <button onClick={onEdit} className="btn-secondary text-xs flex-1">Edit</button>
        <button
          onClick={onDelete}
          className="flex-1 text-xs border border-red-200 text-red-500 rounded-lg py-1.5 hover:bg-red-50 transition"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

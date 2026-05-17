import { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import type { Person, Relationship } from '@/types'

// ─── Layout constants ────────────────────────────────────────────────────────
const CARD_W    = 140   // person card width
const CARD_H    = 76    // person card height
const AVATAR_R  = 22    // avatar circle radius
const COUPLE_GAP = 28   // horizontal gap between spouses
const SIB_GAP   = 28    // min horizontal gap between sibling subtrees
const FAM_GAP   = 70    // gap between unrelated root families
const GEN_GAP   = 110   // vertical space between generations
const PAD       = 80    // canvas padding

const GENDER_COLOR: Record<string, string> = {
  MALE: '#0053e2', FEMALE: '#be185d', OTHER: '#64748b',
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface Unit {
  id: string
  members: Person[]       // 1 (single) or 2 (couple)
  childIds: string[]      // child unit IDs
  subtreeW: number        // computed subtree width
  cx: number              // center-x of this unit (couple midpoint or single center)
  y: number               // top-y of cards in this unit
}

// ─── Layout builder ──────────────────────────────────────────────────────────
function buildLayout(persons: Person[], relationships: Relationship[]) {
  const personById = new Map(persons.map(p => [p.id, p]))
  const spouseOf    = new Map<number, number>()
  const childrenOf  = new Map<number, Set<number>>()
  const parentsOf   = new Map<number, Set<number>>()

  const addEdge = (m: Map<number, Set<number>>, k: number, v: number) => {
    if (!m.has(k)) m.set(k, new Set())
    m.get(k)!.add(v)
  }

  for (const r of relationships) {
    if (r.relationType === 'SPOUSE') {
      spouseOf.set(r.personId, r.relatedPersonId)
      spouseOf.set(r.relatedPersonId, r.personId)
    } else if (r.relationType === 'PARENT') {
      addEdge(childrenOf, r.personId, r.relatedPersonId)
      addEdge(parentsOf, r.relatedPersonId, r.personId)
    } else if (r.relationType === 'CHILD') {
      addEdge(childrenOf, r.relatedPersonId, r.personId)
      addEdge(parentsOf, r.personId, r.relatedPersonId)
    }
  }

  const units        = new Map<string, Unit>()
  const personToUnit = new Map<number, string>()
  const inProgress   = new Set<number>()

  function buildUnit(pid: number): string {
    if (personToUnit.has(pid)) return personToUnit.get(pid)!
    if (inProgress.has(pid))   return String(pid)
    inProgress.add(pid)

    const spouseId = spouseOf.get(pid)
    const useSpouse = spouseId !== undefined && !personToUnit.has(spouseId)
    const members = useSpouse
      ? [Math.min(pid, spouseId!), Math.max(pid, spouseId!)]
      : [pid]
    const uid = members.join('_')

    if (!units.has(uid)) {
      const childSet = new Set<number>()
      for (const m of members)
        for (const c of childrenOf.get(m) ?? []) childSet.add(c)

      const childUnitSet = new Set<string>()
      for (const c of childSet)
        if (!inProgress.has(c)) childUnitSet.add(buildUnit(c))

      for (const m of members) personToUnit.set(m, uid)

      units.set(uid, {
        id: uid,
        members: members.map(id => personById.get(id)!).filter(Boolean),
        childIds: [...childUnitSet],
        subtreeW: 0, cx: 0, y: 0,
      })
    } else {
      for (const m of members) personToUnit.set(m, uid)
    }

    inProgress.delete(pid)
    return uid
  }

  for (const p of persons) buildUnit(p.id)

  // ── Deduplicate children ────────────────────────────────────────────────────
  // A child unit may have been claimed by multiple parent units (e.g. mom AND
  // dad both have PARENT → son, but aren't marked as spouses). Keep only the
  // first claim so every unit has exactly one parent → no double-positioning.
  const claimedAsChild = new Set<string>()
  for (const u of units.values()) {
    u.childIds = u.childIds.filter(cid => {
      if (claimedAsChild.has(cid)) return false
      claimedAsChild.add(cid)
      return true
    })
  }

  // Find roots (units not referenced as a child)
  const allChildIds = new Set<string>()
  for (const u of units.values()) u.childIds.forEach(c => allChildIds.add(c))
  const rootIds = [...units.keys()].filter(id => !allChildIds.has(id))

  // Own width of a unit (ignoring children)
  const ownW = (u: Unit) => u.members.length === 2 ? CARD_W * 2 + COUPLE_GAP : CARD_W

  // Bottom-up: compute subtree widths
  function calcWidth(uid: string): number {
    const u = units.get(uid)!
    if (u.childIds.length === 0) { u.subtreeW = ownW(u); return u.subtreeW }
    const childSum = u.childIds.reduce((s, c) => s + calcWidth(c), 0)
    const childGaps = (u.childIds.length - 1) * SIB_GAP
    u.subtreeW = Math.max(ownW(u), childSum + childGaps)
    return u.subtreeW
  }
  for (const rid of rootIds) calcWidth(rid)

  // Top-down: assign positions
  function assignPos(uid: string, startX: number, y: number) {
    const u = units.get(uid)!
    u.cx = startX + u.subtreeW / 2
    u.y  = y

    if (u.childIds.length === 0) return

    const childrenTotalW = u.childIds.reduce((s, c) => s + units.get(c)!.subtreeW, 0)
    const childrenGaps   = (u.childIds.length - 1) * SIB_GAP
    let cx = u.cx - (childrenTotalW + childrenGaps) / 2

    for (const cid of u.childIds) {
      assignPos(cid, cx, y + CARD_H + GEN_GAP)
      cx += units.get(cid)!.subtreeW + SIB_GAP
    }
  }

  let rx = PAD
  for (const rid of rootIds) {
    assignPos(rid, rx, PAD)
    rx += units.get(rid)!.subtreeW + FAM_GAP
  }

  return { units, rootIds, personToUnit }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const card1X = (u: Unit) => u.members.length === 2
  ? u.cx - COUPLE_GAP / 2 - CARD_W : u.cx - CARD_W / 2
const card2X = (u: Unit) => u.cx + COUPLE_GAP / 2
const cardBottomY  = (u: Unit) => u.y + CARD_H
const coupleMidY   = (u: Unit) => u.y + CARD_H / 2

// ─── Component ───────────────────────────────────────────────────────────────
interface Props {
  persons: Person[]
  relationships: Relationship[]
  selectedId: number | null
  onSelectPerson: (person: Person) => void
}

export default function FamilyTreeGraph({ persons, relationships, selectedId, onSelectPerson }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const layout = useMemo(
    () => buildLayout(persons, relationships),
    [persons, relationships]
  )

  useEffect(() => {
    if (!svgRef.current || persons.length === 0) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const { units } = layout

    // Compute canvas size
    let maxX = 0, maxY = 0
    for (const u of units.values()) {
      const ux = card1X(u) + (u.members.length === 2 ? CARD_W * 2 + COUPLE_GAP : CARD_W)
      const uy = u.y + CARD_H
      if (isFinite(ux)) maxX = Math.max(maxX, ux)
      if (isFinite(uy)) maxY = Math.max(maxY, uy)
    }
    if (maxX === 0 || maxY === 0) return // nothing valid to render
    const canvasW = maxX + PAD
    const canvasH = maxY + PAD

    svg.attr('viewBox', `0 0 ${canvasW} ${canvasH}`)

    // Zoom / pan
    const root = svg.append('g')
    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.15, 2.5])
        .on('zoom', e => root.attr('transform', e.transform))
    )

    // ── Connector lines (drawn first, behind cards) ──────────────────────────
    const connG = root.append('g').attr('class', 'connectors')

    for (const u of units.values()) {
      if (u.childIds.length === 0) continue

      const parentX  = u.cx
      const parentY  = u.members.length === 2 ? coupleMidY(u) : cardBottomY(u)
      const junctionY = u.y + CARD_H + GEN_GAP * 0.45

      // Drop from parent
      connG.append('line')
        .attr('x1', parentX).attr('y1', parentY)
        .attr('x2', parentX).attr('y2', junctionY)
        .attr('stroke', '#94a3b8').attr('stroke-width', 1.8)

      const children = u.childIds.map(id => units.get(id)!)
      const leftX  = children[0].cx
      const rightX = children[children.length - 1].cx

      // Horizontal sibling bar
      if (children.length > 1) {
        connG.append('line')
          .attr('x1', leftX).attr('y1', junctionY)
          .attr('x2', rightX).attr('y2', junctionY)
          .attr('stroke', '#94a3b8').attr('stroke-width', 1.8)
      }

      // Drop to each child
      for (const cu of children) {
        connG.append('line')
          .attr('x1', cu.cx).attr('y1', junctionY)
          .attr('x2', cu.cx).attr('y2', cu.y)
          .attr('stroke', '#94a3b8').attr('stroke-width', 1.8)
      }
    }

    // ── Couple bars ──────────────────────────────────────────────────────────
    const coupleG = root.append('g').attr('class', 'couples')

    for (const u of units.values()) {
      if (u.members.length < 2) continue
      const barY = coupleMidY(u)
      const x1 = card1X(u) + CARD_W   // right edge of left card
      const x2 = card2X(u)            // left edge of right card

      coupleG.append('line')
        .attr('x1', x1).attr('y1', barY)
        .attr('x2', x2).attr('y2', barY)
        .attr('stroke', '#fda4af').attr('stroke-width', 2.5)
        .attr('stroke-dasharray', '4 2')

      coupleG.append('text')
        .attr('x', u.cx).attr('y', barY + 4.5)
        .attr('text-anchor', 'middle').attr('font-size', 13)
        .text('❤')
    }

    // ── Person cards ─────────────────────────────────────────────────────────
    const cardG = root.append('g').attr('class', 'cards')

    function drawCard(person: Person, x: number, y: number) {
      const isSelected = person.id === selectedId
      const color      = GENDER_COLOR[person.gender ?? ''] ?? '#64748b'
      const g          = cardG.append('g')
        .attr('transform', `translate(${x},${y})`)
        .attr('cursor', 'pointer')
        .on('click', () => onSelectPerson(person))

      // Shadow / card background
      g.append('rect')
        .attr('width', CARD_W).attr('height', CARD_H).attr('rx', 12)
        .attr('fill', isSelected ? '#eff6ff' : '#ffffff')
        .attr('stroke', isSelected ? '#ffc220' : '#e2e8f0')
        .attr('stroke-width', isSelected ? 3 : 1.5)
        .style('filter', isSelected
          ? 'drop-shadow(0 0 8px rgba(255,194,32,0.55))'
          : 'drop-shadow(0 2px 6px rgba(0,0,0,0.09))')

      // Avatar circle
      const ax = AVATAR_R + 10
      const ay = CARD_H / 2
      g.append('circle').attr('cx', ax).attr('cy', ay).attr('r', AVATAR_R).attr('fill', color)
      g.append('text')
        .attr('x', ax).attr('y', ay)
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
        .attr('fill', '#fff').attr('font-size', 11).attr('font-weight', 700)
        .attr('pointer-events', 'none')
        .text(`${person.firstName[0]}${person.lastName?.[0] ?? ''}`)

      // Text area
      const tx = ax + AVATAR_R + 8
      const fullName = `${person.firstName} ${person.lastName ?? ''}`.trim()
      const name     = fullName.length > 13 ? fullName.slice(0, 12) + '…' : fullName

      g.append('text')
        .attr('x', tx).attr('y', ay - (person.dateOfBirth ? 12 : 5))
        .attr('font-size', 11).attr('font-weight', 600).attr('fill', '#0f172a')
        .attr('pointer-events', 'none')
        .text(name)

      if (person.dateOfBirth) {
        const by = new Date(person.dateOfBirth).getFullYear()
        const dy = person.dateOfDeath ? new Date(person.dateOfDeath).getFullYear() : null
        g.append('text')
          .attr('x', tx).attr('y', ay + 4)
          .attr('font-size', 9).attr('fill', '#64748b')
          .attr('pointer-events', 'none')
          .text(dy ? `${by} – ${dy}` : `b. ${by}`)
      }

      if (person.dateOfDeath) {
        g.append('text')
          .attr('x', tx).attr('y', ay + 15)
          .attr('font-size', 8.5).attr('fill', '#94a3b8').attr('font-style', 'italic')
          .attr('pointer-events', 'none')
          .text('† Deceased')
      }
    }

    for (const u of units.values()) {
      if (u.members.length === 1) {
        drawCard(u.members[0], card1X(u), u.y)
      } else {
        drawCard(u.members[0], card1X(u), u.y)
        drawCard(u.members[1], card2X(u), u.y)
      }
    }

  }, [layout, selectedId, onSelectPerson, persons.length])

  if (persons.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
        <p className="text-5xl mb-3">👤</p>
        <p className="text-lg font-medium">No people yet</p>
        <p className="text-sm mt-1">Add your first family member to get started!</p>
      </div>
    )
  }

  return (
    <div className="flex-1 relative bg-slate-50 overflow-hidden">
      {/* Legend */}
      <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur rounded-xl border border-gray-200 shadow-sm p-3 text-xs space-y-1.5">
        <p className="font-semibold text-gray-500 uppercase tracking-wide text-[10px] mb-2">Gender</p>
        {Object.entries(GENDER_COLOR).map(([g, c]) => (
          <div key={g} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c }} />
            <span className="text-gray-600 capitalize">{g.toLowerCase()}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1 border-t border-gray-100 mt-1">
          <span className="text-pink-400 text-sm">❤</span>
          <span className="text-gray-600">Couple</span>
        </div>
      </div>

      <p className="absolute bottom-3 right-3 z-10 text-[11px] text-gray-400">
        Scroll to zoom · Drag to pan · Click a person
      </p>

      <svg ref={svgRef} className="w-full h-full" />
    </div>
  )
}

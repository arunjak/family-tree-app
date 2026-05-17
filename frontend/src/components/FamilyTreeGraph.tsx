import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { Person, Relationship } from '@/types'

interface Props {
  persons: Person[]
  relationships: Relationship[]
  selectedId: number | null
  onSelectPerson: (person: Person) => void
}

interface D3Node extends d3.SimulationNodeDatum {
  id: number
  person: Person
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  relationship: Relationship
}

const GENDER_COLOR: Record<string, string> = {
  MALE: '#0053e2',
  FEMALE: '#d946ef',
  OTHER: '#64748b',
}

const LINK_COLOR: Record<string, string> = {
  PARENT: '#f59e0b',
  CHILD: '#10b981',
  SPOUSE: '#ef4444',
  SIBLING: '#8b5cf6',
}

export default function FamilyTreeGraph({ persons, relationships, selectedId, onSelectPerson }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const simulationRef = useRef<d3.Simulation<D3Node, D3Link> | null>(null)

  useEffect(() => {
    if (!svgRef.current || persons.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = svgRef.current.clientWidth || 800
    const height = svgRef.current.clientHeight || 500

    // Zoom layer
    const zoomG = svg.append('g')
    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.2, 3])
        .on('zoom', (event) => zoomG.attr('transform', event.transform))
    )

    const nodes: D3Node[] = persons.map((p) => ({ id: p.id, person: p }))
    const nodeById = new Map(nodes.map((n) => [n.id, n]))

    const links: D3Link[] = relationships
      .map((r) => ({
        source: nodeById.get(r.personId)!,
        target: nodeById.get(r.relatedPersonId)!,
        relationship: r,
      }))
      .filter((l) => l.source && l.target)

    // Simulation
    const simulation = d3.forceSimulation<D3Node>(nodes)
      .force('link', d3.forceLink<D3Node, D3Link>(links).id((d) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide(50))

    simulationRef.current = simulation

    // Arrowhead marker
    svg.append('defs').selectAll('marker')
      .data(['arrow'])
      .join('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 30)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#94a3b8')

    // Links
    const link = zoomG.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', (d) => LINK_COLOR[d.relationship.relationType] ?? '#94a3b8')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.7)
      .attr('marker-end', 'url(#arrow)')

    // Link labels
    const linkLabel = zoomG.append('g')
      .selectAll('text')
      .data(links)
      .join('text')
      .attr('font-size', 9)
      .attr('fill', '#64748b')
      .attr('text-anchor', 'middle')
      .attr('dy', -4)
      .text((d) => d.relationship.relationType.toLowerCase())

    // Node groups
    const node = zoomG.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, D3Node>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x; d.fy = d.y
          })
          .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null; d.fy = null
          })
      )
      .on('click', (_, d) => onSelectPerson(d.person))

    // Circle
    node.append('circle')
      .attr('r', 26)
      .attr('fill', (d) => GENDER_COLOR[d.person.gender ?? ''] ?? '#64748b')
      .attr('stroke', (d) => d.person.id === selectedId ? '#ffc220' : '#fff')
      .attr('stroke-width', (d) => d.person.id === selectedId ? 4 : 2)
      .attr('filter', (d) => d.person.id === selectedId ? 'drop-shadow(0 0 6px #ffc220)' : '')

    // Initials
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#fff')
      .attr('font-size', 13)
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none')
      .text((d) => `${d.person.firstName[0]}${d.person.lastName?.[0] ?? ''}`)

    // Name label
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 42)
      .attr('font-size', 11)
      .attr('fill', '#1e293b')
      .attr('font-weight', '500')
      .attr('pointer-events', 'none')
      .text((d) => `${d.person.firstName} ${d.person.lastName ?? ''}`.trim())

    // Deceased indicator
    node.filter((d) => !!d.person.dateOfDeath)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 54)
      .attr('font-size', 9)
      .attr('fill', '#94a3b8')
      .attr('pointer-events', 'none')
      .text('† deceased')

    // Tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as D3Node).x!)
        .attr('y1', (d) => (d.source as D3Node).y!)
        .attr('x2', (d) => (d.target as D3Node).x!)
        .attr('y2', (d) => (d.target as D3Node).y!)

      linkLabel
        .attr('x', (d) => ((d.source as D3Node).x! + (d.target as D3Node).x!) / 2)
        .attr('y', (d) => ((d.source as D3Node).y! + (d.target as D3Node).y!) / 2)

      node.attr('transform', (d) => `translate(${d.x},${d.y})`)
    })

    return () => { simulation.stop() }
  }, [persons, relationships, selectedId, onSelectPerson])

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
    <div className="flex-1 relative bg-gray-50">
      {/* Legend */}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-xl border border-gray-200 p-3 text-xs space-y-1 z-10 shadow-sm">
        <p className="font-semibold text-gray-600 mb-2">Relationships</p>
        {Object.entries(LINK_COLOR).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div className="w-4 h-0.5" style={{ background: color }} />
            <span className="text-gray-600 capitalize">{type.toLowerCase()}</span>
          </div>
        ))}
        <p className="font-semibold text-gray-600 mt-3 mb-1">Gender</p>
        {Object.entries(GENDER_COLOR).map(([g, c]) => (
          <div key={g} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: c }} />
            <span className="text-gray-600 capitalize">{g.toLowerCase()}</span>
          </div>
        ))}
      </div>
      <p className="absolute bottom-3 right-3 text-xs text-gray-400 z-10">
        Scroll to zoom · Drag to pan · Click a person
      </p>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  )
}

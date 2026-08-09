import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import * as d3 from 'd3'
import './FamilyTree.css'

const SPECIES_EMOJI = {
  'Perro': '🐕', 'Gato': '🐈', 'Conejo': '🐇', 'Pájaro': '🐦',
  'Pez': '🐠', 'Tortuga': '🐢', 'Hámster': '🐹', 'Otro': '🐾',
}

export default function FamilyTree({ pets }) {
  const svgRef = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    if (!pets.length) return
    const el = svgRef.current
    const W = el.clientWidth || 900
    const H = 600

    d3.select(el).selectAll('*').remove()

    const nodes = pets.map(p => ({
      id: p.id,
      name: p.name,
      species: p.species,
      color: p.color || '#E8875A',
      alive: !p.deathYear,
      emoji: SPECIES_EMOJI[p.species] || '🐾',
    }))

    const links = []
    pets.forEach(p => {
      p.offspring.forEach(oid => {
        if (pets.find(x => x.id === oid)) {
          links.push({ source: p.id, target: oid })
        }
      })
    })

    const svg = d3.select(el)
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('width', '100%')
      .attr('height', H)

    // Defs for avatar clips
    const defs = svg.append('defs')
    nodes.forEach(n => {
      defs.append('clipPath')
        .attr('id', `clip-${n.id}`)
        .append('circle')
        .attr('r', 28)
    })

    const g = svg.append('g')

    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', e => g.attr('transform', e.transform))
    svg.call(zoom)

    // Links
    const link = g.selectAll('.tree-link')
      .data(links)
      .enter().append('line')
      .attr('class', 'tree-link')
      .attr('stroke', '#D9C2A0')
      .attr('stroke-width', 2.5)
      .attr('stroke-dasharray', '6,3')

    // Simulation
    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(130).strength(0.6))
      .force('charge', d3.forceManyBody().strength(-320))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide(60))

    // Node groups
    const node = g.selectAll('.tree-node')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'tree-node')
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y })
        .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null })
      )
      .on('click', (_, d) => navigate(`/pet/${d.id}`))

    // Circle bg
    node.append('circle')
      .attr('r', 36)
      .attr('fill', d => d.alive ? 'white' : '#F5F0FF')
      .attr('stroke', d => d.color)
      .attr('stroke-width', 3.5)
      .style('filter', 'drop-shadow(0 3px 8px rgba(92,61,30,0.18))')

    // Emoji label
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '1.6rem')
      .text(d => d.emoji)

    // Rainbow for deceased
    node.filter(d => !d.alive).append('text')
      .attr('x', 26).attr('y', -22)
      .attr('font-size', '1rem')
      .text('🌈')

    // Name label
    node.append('text')
      .attr('y', 50)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Fredoka One, cursive')
      .attr('font-size', '13px')
      .attr('fill', '#5C3D1E')
      .text(d => d.name)

    sim.on('tick', () => {
      link
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y)
      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    return () => sim.stop()
  }, [pets, navigate])

  return (
    <div className="page tree-page">
      <div className="container">
        <div className="tree-header">
          <h1>🌳 Árbol familiar</h1>
          <p>Hacé click en una mascota para ver su ficha. Podés arrastrar los nodos y hacer zoom.</p>
        </div>
        {pets.length === 0 ? (
          <div className="empty-state"><div className="emoji">🌳</div><p>Sin mascotas aún.</p></div>
        ) : (
          <div className="tree-canvas card">
            <svg ref={svgRef} />
          </div>
        )}
        <div className="tree-legend">
          <div className="legend-item"><div className="legend-dot" style={{ background: 'white', border: '3px solid var(--paw)' }} />Activo</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: '#F5F0FF', border: '3px solid var(--lavender)' }} />En el recuerdo</div>
          <div className="legend-item"><div style={{ borderTop: '2px dashed var(--sand-dark)', width: 32 }} />Vínculo familiar</div>
        </div>
      </div>
    </div>
  )
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GALERIA } from './data'

const TODAS = 'Todas'

export default function Galeria() {
  const cats = useMemo(() => [TODAS, ...Array.from(new Set(GALERIA.map(g => g.cat)))], [])
  const [cat, setCat] = useState(TODAS)
  const [aberta, setAberta] = useState<number | null>(null)
  const origem = useRef<HTMLElement | null>(null)
  const lista = useMemo(() => (cat === TODAS ? GALERIA : GALERIA.filter(g => g.cat === cat)), [cat])
  const foto = aberta !== null ? lista[aberta] : undefined

  const abrir = (i: number) => { origem.current = document.activeElement as HTMLElement | null; setAberta(i) }
  const fechar = useCallback(() => { setAberta(null); origem.current?.focus() }, [])
  const ir = useCallback((d: number) => setAberta(i => (i === null ? i : (i + d + lista.length) % lista.length)), [lista.length])

  // Lightbox: Esc fecha, setas navegam, o scroll da página fica bloqueado
  useEffect(() => {
    if (aberta === null) return
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar()
      else if (e.key === 'ArrowLeft') ir(-1)
      else if (e.key === 'ArrowRight') ir(1)
    }
    const antes = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', k)
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = antes }
  }, [aberta, fechar, ir])

  return (
    <section id="galeria">
      <h2 className="scroll-fx">Gale<span>ria</span></h2>
      <p className="lead scroll-fx">Dias de jogo, treinos e bastidores. Toque numa foto para a ver em ecrã grande.</p>
      <div className="tabs scroll-fx" aria-label="Filtrar fotografias">
        {cats.map(c => (
          <button key={c} aria-pressed={c === cat} className={c === cat ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      <div className="galeria">
        {lista.map((g, i) => (
          <figure key={g.src} className="gi scroll-fx fx-soft">
            <button type="button" onClick={() => abrir(i)} aria-label={`Ampliar: ${g.titulo}`}>
              <img src={g.src} alt={g.alt} loading="lazy" />
              <span className="gc">
                <em>{g.cat}</em>
                <b>{g.titulo}</b>
                <span>{g.legenda}</span>
              </span>
            </button>
          </figure>
        ))}
      </div>

      {foto && (
        <div className="lb" role="dialog" aria-modal="true" aria-label={foto.titulo} onClick={e => { if (e.target === e.currentTarget) fechar() }}>
          <button type="button" className="lb-x" aria-label="Fechar" onClick={fechar} autoFocus>×</button>
          <button type="button" className="nb prev" aria-label="Foto anterior" onClick={() => ir(-1)}>‹</button>
          <figure>
            <img src={foto.src} alt={foto.alt} />
            <figcaption>
              <em>{foto.cat}</em>
              <b>{foto.titulo}</b>
              <span>{foto.legenda}</span>
              <small>{(aberta ?? 0) + 1} / {lista.length}</small>
            </figcaption>
          </figure>
          <button type="button" className="nb next" aria-label="Foto seguinte" onClick={() => ir(1)}>›</button>
        </div>
      )}
    </section>
  )
}

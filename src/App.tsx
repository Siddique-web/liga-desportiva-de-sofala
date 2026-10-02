import { useEffect, useState, type ReactNode } from 'react'
import Loja from './Loja'
import Recrutamento from './Recrutamento'
import Admin from './Admin'
import { useScrollAnimation } from './useScrollAnimation'
import { COMPETICOES, CONQUISTAS, EVENTOS, GALERIA, HISTORIAL, LOJA_DESTAQUE, NOTICIAS, PLANTEL, POS, SOCIOS, TREINADOR, XI } from './data'

const D = '–'
const pad = (n: number) => String(n).padStart(2, '0')
const FILTROS: Record<string, (p: (typeof PLANTEL)[number]) => boolean> = {
  Todos: () => true, 'Guarda-redes': p => p.pos === 'GR', Defesas: p => p.pos === 'DEF',
  Médios: p => p.pos === 'MED', Avançados: p => p.pos === 'AVA', Suplentes: p => !p.xi,
}
// Foto do jogador: public/jogadores/<nº>.jpg (ou campo `foto` em data.ts). Sem foto → placeholder com o emblema.
function Foto({ p, children }: { p: (typeof PLANTEL)[number]; children?: ReactNode }) {
  const [err, setErr] = useState(false)
  return (
    <div className="ph">
      {err ? <span className="ph-logo" aria-hidden="true" />
        : <img src={p.foto ?? `/jogadores/${p.n}.jpg`} alt={`${p.nm}, ${p.pos ? POS[p.pos] : 'jogador'} da LDS`} loading="lazy" onError={() => setErr(true)} />}
      {children}
    </div>
  )
}
const Footer = () => <footer className="scroll-fx fx-soft">© L.D.S. — Liga Desportiva de Sofala · Beira, Moçambique</footer>
const FUNDO = 'radial-gradient(circle at 75% 25%,#2f8a4a,#1e4d2b 40%,#04100a)'

function News() {
  const [i, setI] = useState(0)
  const [hold, setHold] = useState(false)
  const total = NOTICIAS.length
  const go = (k: number) => setI(x => (x + k + total) % total)
  useEffect(() => {
    if (hold) return
    const t = setTimeout(() => setI(x => (x + 1) % total), 5000)
    return () => clearTimeout(t)
  }, [i, hold, total])
  return (
    <div className={'news' + (hold ? ' hold' : '')} id="news" role="region" aria-roledescription="carrossel" aria-label="Notícias do clube"
      onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
      {NOTICIAS.map((n, k) => (
        <div key={k} className={'sl' + (k === i ? ' on' : '')} aria-hidden={k !== i}>
          {n.img && <div className="sl-bg" style={{ backgroundImage: `url(${n.img}),${FUNDO}` }} />}
          <div className="sl-in">
            {n.img && <img className="sl-img" src={n.img} alt={n.alt || n.t} />}
            <div className="sl-c"><em>{n.tag}</em><h2>{n.t}</h2><p>{n.d}</p>
              {n.link && <a className="btn p" href={n.link} tabIndex={k === i ? 0 : -1}>{n.cta || 'Saber mais'}</a>}</div>
          </div>
        </div>
      ))}
      <button className="nb prev" aria-label="Notícia anterior" onClick={() => go(-1)}>‹</button>
      <button className="nb next" aria-label="Notícia seguinte" onClick={() => go(1)}>›</button>
      <div className="dots">{NOTICIAS.map((_, k) => (
        <button key={k} className={k === i ? 'on' : ''} aria-label={`Ir para a notícia ${k + 1}`} aria-current={k === i} onClick={() => setI(k)}><span /></button>
      ))}</div>
    </div>
  )
}

function Nav({ home = false }: { home?: boolean }) {
  return (
    <nav aria-label="Navegação principal">
      <a className="brand" href="#/" aria-label="Liga Desportiva de Sofala — início">
        <span className="logo" aria-hidden="true" /><b>L.D.S</b>
      </a>
      {home ? <>
        <a href="#news">Notícias</a><a href="#class">Classificação</a><a href="#xi">Match Center</a>
        <a href="#plantel">Plantel</a><a href="#loja">Loja</a><a href="#socios">Sócios</a><a href="#eventos">Eventos</a><a href="#conq">Conquistas</a><a href="#hist">Historial</a><a href="#/recrutamento">Recrutamento</a>
      </> : <>
        <a href="#/">Início</a><a href="#/loja">Loja</a><a href="#/recrutamento">Recrutamento</a>
      </>}
    </nav>
  )
}

function Home() {
  const comps = Object.keys(COMPETICOES)
  const [comp, setComp] = useState(comps[0])
  const [filtro, setFiltro] = useState('Todos')
  const [sel, setSel] = useState<number | null>(null)
  const p = PLANTEL.find(x => x.n === sel)
  const f = (v?: string | number) => v ?? D

  return (
    <>
      <Nav home />

      <div className="scroll-fx fx-hero"><News /></div>

      <section className="hero">
        <h1 className="scroll-fx">Liga Desportiva<br /><span>de Sofala</span></h1>
        <p className="scroll-fx">O site oficial do clube da Beira. Resultados, classificações, plantel e a história verde e branca.</p>
        <div className="cta scroll-fx"><a className="btn p" href="#xi">Ver Onze Inicial</a><a className="btn" href="#class">Classificação</a></div>
        <div className="stats"><div className="scroll-fx">2017<small>Fundação</small></div><div className="scroll-fx">Moçambola<small>Competição</small></div><div className="scroll-fx">{TREINADOR.nome}<small>{TREINADOR.cargo}</small></div></div>
      </section>

      <div className="light"><section id="class">
        <h2 className="scroll-fx">Classi<span>ficação</span></h2>
        <div className="tabs scroll-fx">{comps.map(c => <button key={c} className={c === comp ? 'on' : ''} onClick={() => setComp(c)}>{c}</button>)}</div>
        <div className="wrap scroll-fx fx-soft"><table>
          <thead><tr><th>#</th><th>Clube</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GM</th><th>GS</th><th>DG</th><th>Pts</th></tr></thead>
          <tbody>{COMPETICOES[comp].map((r, k) => (
            <tr key={r.c} className={r.me ? 'me' : ''}>
              <td>{k + 1}</td><td>{r.c}</td><td>{r.j}</td><td>{r.v}</td><td>{r.e}</td><td>{r.d}</td>
              <td>{r.gm}</td><td>{r.gs}</td><td>{r.gm - r.gs > 0 ? '+' : ''}{r.gm - r.gs}</td><td><b>{r.pts}</b></td>
            </tr>))}</tbody>
        </table></div>
      </section></div>

      <div className="light"><section id="xi" className="center">
        <h2 className="scroll-fx">Match <span>Center</span></h2>
        <p className="lead scroll-fx">UD Songo vs LDS — Onze Inicial. Toque num jogador.</p>
        <div className="pitch scroll-fx fx-soft">{XI.map(x => {
          const j = PLANTEL.find(q => q.n === x.n)!
          return <button key={x.n} className={'pl' + (j.cap ? ' c' : '')} style={{ left: `${x.x}%`, top: `${x.y}%` }} onClick={() => setSel(x.n)}>
            <i>{x.n}</i>{j.nm}{j.cap ? ' (C)' : ''}</button>
        })}</div>
        <p className="bench scroll-fx"><b>Suplentes:</b> {PLANTEL.filter(q => !q.xi).map(q => `${pad(q.n)} ${q.nm}`).join(' · ')}<br /><b>{TREINADOR.cargo}:</b> {TREINADOR.nome}</p>
        <div className="gallery">{GALERIA.map(g => (
          <figure key={g.src} className="scroll-fx fx-soft"><img src={g.src} alt={g.alt} loading="lazy" /><figcaption>{g.legenda}</figcaption></figure>
        ))}</div>
      </section></div>

      <div className="green"><section id="plantel">
        <h2 className="scroll-fx">Plan<span>tel</span></h2>
        <p className="lead scroll-fx">Toque num jogador para ver a ficha completa.</p>
        <div className="tabs scroll-fx">{Object.keys(FILTROS).map(k => <button key={k} className={k === filtro ? 'on' : ''} onClick={() => setFiltro(k)}>{k}</button>)}</div>
        <div className="pg">{PLANTEL.filter(FILTROS[filtro]).sort((a, b) => a.n - b.n).map(q => (
          <div key={q.n} className="scroll-fx"><button className={`pc ${q.cap ? 'cap' : ''} ${q.xi ? '' : 'st'}`} onClick={() => setSel(q.n)}>
            <Foto p={q}>
              <span className="no">{pad(q.n)}</span>
              <span className="role">{q.cap ? 'Capitão' : q.xi ? 'Onze inicial' : 'Suplente'}</span>
            </Foto>
            <div className="pb">
              <h3>{q.nm}{q.cap ? ' (C)' : ''}</h3>
              <small>{q.pos ? POS[q.pos] : 'Posição a definir'}</small>
              <div className="mini"><span><b>{f(q.idade)}</b>Idade</span><span><b>{f(q.altura)}</b>Altura</span><span><b>{f(q.jogos)}</b>Jogos</span><span><b>{f(q.golos)}</b>Golos</span></div>
            </div>
          </button></div>))}</div>
      </section></div>

      <section id="loja">
        <h2 className="scroll-fx">Loja <span>Oficial</span></h2>
        <p className="lead scroll-fx">Já disponível para venda — {LOJA_DESTAQUE.nota.toLowerCase()}.</p>
        <div className="shopfeat">
          <div className="shopimgs">{LOJA_DESTAQUE.imgs.map(im => <img key={im.src} className="scroll-fx fx-soft" src={im.src} alt={im.alt} loading="lazy" />)}</div>
          <div className="shoptxt scroll-fx">
            <b className="price">{LOJA_DESTAQUE.preco}</b>
            <p>Os novos equipamentos oficiais do clube já estão à venda. Adquire já o teu exemplar e veste as cores do clube!</p>
            <p className="hint">Pagamento por M-Pesa, e-Mola ou transferência bancária.</p>
            <a className="btn p" href="#/loja">Comprar equipamento</a>
          </div>
        </div>
      </section>

      <div className="light"><section id="socios">
        <h2 className="scroll-fx">Área de <span>Sócios</span></h2>
        <p className="lead scroll-fx">Junte-se à LDS e faça parte da nossa história.</p>
        <div className="split">
          <img className="poster scroll-fx fx-soft" src={SOCIOS.img} alt="Cartaz da campanha Seja Sócio da LDS" loading="lazy" />
          <div className="info">
            <div className="card2 scroll-fx"><h3>Requisitos</h3><ul>{SOCIOS.requisitos.map(r => <li key={r}>{r}</li>)}</ul></div>
            <div className="card2 scroll-fx"><h3>Levantamento de cartões</h3><p>{SOCIOS.levantamento}</p></div>
            <div className="card2 scroll-fx"><h3>Contactos</h3><p>{SOCIOS.contactos.map(c => <a key={c.wa} className="tel" href={`https://wa.me/${c.wa}`} target="_blank" rel="noreferrer">{c.label}</a>)}</p></div>
          </div>
        </div>
      </section></div>

      <div className="green"><section id="eventos">
        <h2 className="scroll-fx">Eventos e <span>Comunidade</span></h2>
        <p className="lead scroll-fx">A LDS perto dos adeptos.</p>
        {EVENTOS.map(e => {
          const passado = new Date(e.fim).getTime() < Date.now()
          return (
            <article key={e.t} className="split ev">
              <img className="poster scroll-fx fx-soft" src={e.img} alt={e.alt} loading="lazy" />
              <div className="info scroll-fx">
                <span className={'badge' + (passado ? ' past' : '')}>{passado ? 'Realizado' : 'Próximo evento'}</span>
                <h3>{e.t}</h3><p>{e.d}</p>
                <ul className="meta"><li>📅 {e.quando}</li><li>📍 {e.onde}</li><li>🎟️ {e.extra}</li></ul>
              </div>
            </article>)
        })}
      </section></div>

      <section id="conq">
        <h2 className="scroll-fx">Conqui<span>stas</span></h2>
        <div className="grid" style={{ marginTop: 18 }}>{CONQUISTAS.map((c, k) => <div className="card scroll-fx" key={k}><h3>🏆 {c.t}</h3><small>{c.s}</small><p>{c.d}</p></div>)}</div>
      </section>

      <div className="light"><section id="hist">
        <h2 className="scroll-fx">Histo<span>rial</span></h2>
        <div className="tl" style={{ marginTop: 22 }}>{HISTORIAL.map((h, k) => <div key={k} className="scroll-fx"><b>{h.a}</b><h3 style={{ fontSize: '1.1rem' }}>{h.t}</h3><p>{h.d}</p></div>)}</div>
      </section></div>

      <Footer />

      <div className={'modal' + (p ? ' on' : '')} onClick={e => { if (e.target === e.currentTarget) setSel(null) }}>
        {p && <div className="mb">
          <Foto key={p.n} p={p} />
          <div className="big">{pad(p.n)}</div><h3>{p.nm}{p.cap ? ' (C)' : ''}</h3>
          <small style={{ color: 'var(--m)' }}>{p.pos ? POS[p.pos] : 'Posição a definir'} · L.D.S.</small>
          <dl>
            <dt>Idade</dt><dd>{f(p.idade)}</dd><dt>Altura</dt><dd>{f(p.altura)}</dd><dt>Peso</dt><dd>{f(p.peso)}</dd>
            <dt>Pé preferido</dt><dd>{f(p.pe)}</dd><dt>Nacionalidade</dt><dd>{f(p.nac)}</dd><dt>Naturalidade</dt><dd>{f(p.nat)}</dd>
            <dt>Jogos</dt><dd>{f(p.jogos)}</dd><dt>Golos</dt><dd>{f(p.golos)}</dd><dt>Assistências</dt><dd>{f(p.ass)}</dd><dt>Cartões</dt><dd>{f(p.cart)}</dd>
          </dl>
          <button className="btn p" onClick={() => setSel(null)}>Fechar</button>
        </div>}
      </div>
    </>
  )
}

export default function App() {
  useScrollAnimation()
  const [r, setR] = useState(location.hash)
  useEffect(() => { const h = () => { setR(location.hash); if (location.hash.startsWith('#/')) scrollTo(0, 0) }; addEventListener('hashchange', h); return () => removeEventListener('hashchange', h) }, [])
  const Page = r.startsWith('#/loja') ? Loja : r.startsWith('#/recrutamento') ? Recrutamento : r.startsWith('#/admin') ? Admin : null
  if (!Page) return <Home />
  return <>
    <Nav />
    <Page /><Footer /></>
}

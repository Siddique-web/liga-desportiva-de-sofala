import { useCallback, useEffect, useState } from 'react'
import { api, mt, type Produto } from './api'
import { POSICOES } from './validation'

const ESTADOS = ['Em Análise', 'Convocado para Testes', 'Rejeitado']
const CRIT = [['velocidade', 'Velocidade'], ['tecnica', 'Técnica'], ['visao', 'Visão de Jogo'], ['fisica', 'Condição Física']] as const
const PED = ['Aguarda pagamento', 'Comprovativo recebido', 'Pago', 'Enviado', 'Entregue', 'Cancelada']
const file = (n: string) => `/api/admin/files/${n}`
function embed(u: string) {
  const y = u.match(/(?:youtu\.be\/|v=)([\w-]{11})/), d = u.match(/\/file\/d\/([\w-]+)/)
  return y ? `https://www.youtube.com/embed/${y[1]}` : d ? `https://drive.google.com/file/d/${d[1]}/preview` : ''
}
const Stars = ({ v, on }: { v: number; on: (n: number) => void }) => <span className="stars" role="radiogroup">{[1, 2, 3, 4, 5].map(n => <button key={n} type="button" className={n <= v ? 'on' : ''} onClick={() => on(n)} aria-label={`${n} estrelas`}>★</button>)}</span>

function Candidato({ id, back }: { id: number; back: () => void }) {
  const [a, setA] = useState<any>(null), [ev, setEv] = useState<Record<string, any>>({ velocidade: 0, tecnica: 0, visao: 0, fisica: 0, nota: '' }), [m, setM] = useState('')
  const load = useCallback(() => api(`/api/admin/athletes/${id}`).then(d => { setA(d); if (d.minha) setEv(d.minha) }), [id])
  useEffect(() => { load() }, [load])
  if (!a) return <p>A carregar…</p>
  const guardar = async () => { try { await api(`/api/admin/athletes/${id}/evaluation`, 'PUT', ev); setM('Avaliação guardada.'); load() } catch (e: any) { setM(e.message) } }
  const estado = async (s: string) => { try { const r = await api(`/api/admin/athletes/${id}/status`, 'PUT', { status: s }); setM(r.notificado ? `Estado alterado e candidato notificado por e-mail.` : 'Sem alterações.'); load() } catch (e: any) { setM(e.message) } }
  const emb = a.video_url ? embed(a.video_url) : ''
  return <div className="det"><button className="btn" onClick={back}>← Candidatos</button>
    <div className="two"><div className="card"><img className="foto" src={file(a.foto)} alt={a.nome} /><h3>{a.nome}</h3>
      <dl><dt>Nascimento</dt><dd>{a.nascimento}</dd><dt>Telefone</dt><dd>{a.telefone}</dd><dt>E-mail</dt><dd>{a.email}</dd><dt>Morada</dt><dd>{a.morada}</dd><dt>Posições</dt><dd>{a.pos1} / {a.pos2}</dd><dt>Experiência</dt><dd>{a.experiencia} anos</dd><dt>Clubes</dt><dd>{a.clubes || '—'}</dd></dl>
      <a className="btn" href={file(a.cv)} target="_blank" rel="noreferrer">Abrir currículo (PDF)</a></div>
      <div className="card"><h3>Vídeo</h3>{a.video_file ? <video controls preload="metadata" src={file(a.video_file)} /> : emb ? <iframe src={emb} title="Vídeo" allowFullScreen /> : <a className="btn" href={a.video_url} target="_blank" rel="noreferrer">Abrir link do vídeo</a>}
        <h3>Estado: <span className="tag">{a.status}</span></h3><div className="tabs">{ESTADOS.map(s => <button key={s} className={s === a.status ? 'on' : ''} onClick={() => estado(s)}>{s}</button>)}</div>
        <h3>A minha avaliação</h3>{CRIT.map(([k, l]) => <p key={k} className="crit">{l} <Stars v={ev[k]} on={n => setEv({ ...ev, [k]: n })} /></p>)}
        <label className="form">Notas privadas (só treinadores)<textarea rows={4} value={ev.nota} onChange={e => setEv({ ...ev, nota: e.target.value })} /></label>
        <button className="btn p" onClick={guardar}>Guardar avaliação</button>{m && <p className="msg">{m}</p>}
        {a.evals.length > 0 && <><h3>Equipa técnica</h3>{a.evals.map((e: any) => <p key={e.user_id} className="hint"><b>{e.treinador}</b>: V{e.velocidade} T{e.tecnica} VJ{e.visao} CF{e.fisica}{e.nota && ` — ${e.nota}`}</p>)}</>}</div></div></div>
}

export default function Admin() {
  const [u, setU] = useState<{ name: string } | null | undefined>(undefined), [cr, setCr] = useState({ email: '', password: '' }), [err, setErr] = useState('')
  const [tab, setTab] = useState<'c' | 'e' | 's'>('c'), [lista, setLista] = useState<any[]>([]), [fl, setFl] = useState({ pos: '', status: '', from: '', to: '' }), [sel, setSel] = useState<number | null>(null)
  const [ped, setPed] = useState<any[]>([]), [pr, setPr] = useState<Produto[]>([])
  useEffect(() => { api('/api/me').then(setU).catch(() => setU(null)) }, [])
  const carregar = useCallback(() => {
    const falha = (e: Error) => { if (/Sess/.test(e.message)) setU(null); else setErr(e.message) }
    api(`/api/admin/athletes?${new URLSearchParams(Object.entries(fl).filter(([, v]) => v))}`).then(setLista).catch(falha)
    api('/api/admin/orders').then(setPed).catch(falha); api('/api/products').then(setPr).catch(falha)
  }, [fl])
  useEffect(() => { if (u) carregar() }, [u, carregar])
  if (u === undefined) return <section className="shop"><p>A carregar…</p></section>
  if (!u) return <section className="shop"><h2>Área do <span>treinador</span></h2>
    <form className="card form" style={{ maxWidth: 380 }} onSubmit={async e => { e.preventDefault(); try { setU(await api('/api/login', 'POST', cr)); setErr('') } catch (x: any) { setErr(x.message) } }}>
      <label>E-mail<input type="email" value={cr.email} onChange={e => setCr({ ...cr, email: e.target.value })} autoComplete="username" /></label>
      <label>Palavra-passe<input type="password" value={cr.password} onChange={e => setCr({ ...cr, password: e.target.value })} autoComplete="current-password" /></label>
      {err && <p className="err">{err}</p>}<button className="btn p">Entrar</button></form></section>
  const set = (k: string, v: string) => setFl({ ...fl, [k]: v })
  const estadoPedido = async (id: number, status: string) => { try { await api(`/api/admin/orders/${id}/status`, 'PUT', { status }); setErr('') } catch (x: any) { setErr(x.message) } carregar() }
  const stock = async (p: Produto, s: string, v: number) => { try { await api(`/api/admin/products/${p.id}/stock`, 'PUT', { stock: { ...p.stock, [s]: v } }); setErr('') } catch (x: any) { setErr(x.message) } carregar() }
  return <section className="shop"><div className="adm"><h2>Painel <span>técnico</span></h2><span>{u.name} <button className="btn" onClick={async () => { try { await api('/api/logout', 'POST') } catch {} setU(null) }}>Sair</button></span></div>
    {err && <p className="err" role="alert">{err}</p>}
    <div className="tabs">{([['c', `Candidatos (${lista.length})`], ['e', `Encomendas (${ped.length})`], ['s', 'Stock']] as const).map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => { setTab(k); setSel(null) }}>{l}</button>)}</div>
    {tab === 'c' && (sel ? <Candidato id={sel} back={() => { setSel(null); carregar() }} /> : <>
      <div className="filters"><select value={fl.pos} onChange={e => set('pos', e.target.value)}><option value="">Todas as posições</option>{POSICOES.map(p => <option key={p}>{p}</option>)}</select>
        <select value={fl.status} onChange={e => set('status', e.target.value)}><option value="">Todos os estados</option>{ESTADOS.map(s => <option key={s}>{s}</option>)}</select>
        <input type="date" value={fl.from} onChange={e => set('from', e.target.value)} aria-label="De" /><input type="date" value={fl.to} onChange={e => set('to', e.target.value)} aria-label="Até" /></div>
      <div className="wrap"><table><thead><tr><th>Nome</th><th>Posição</th><th>Estado</th><th>Média</th><th>Data</th></tr></thead>
        <tbody>{lista.map(a => <tr key={a.id} className="click" onClick={() => setSel(a.id)}><td>{a.nome}</td><td>{a.pos1}</td><td>{a.status}</td><td>{a.media ? `★ ${a.media}` : '—'}</td><td>{a.created_at.slice(0, 10)}</td></tr>)}</tbody></table></div></>)}
    {tab === 'e' && <div className="wrap"><table><thead><tr><th>Código</th><th>Cliente</th><th>Artigos</th><th>Total</th><th>Método</th><th>Prova</th><th>Estado</th></tr></thead>
      <tbody>{ped.map(o => <tr key={o.id}><td>{o.code}</td><td>{o.name}<br /><small>{o.phone} · {o.address}, {o.city}</small></td><td>{o.items.map((i: any) => `${i.qty}× ${i.name} (${i.size})`).join('; ')}</td><td>{mt(o.total)}</td><td>{o.method}</td>
        <td>{o.proof ? <a href={file(o.proof)} target="_blank" rel="noreferrer">Ver</a> : '—'}</td>
        <td><select value={o.status} onChange={e => estadoPedido(o.id, e.target.value)}>{PED.map(s => <option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table></div>}
    {tab === 's' && <div className="grid">{pr.map(p => <div className="card" key={p.id}><h3>{p.name}</h3>{p.sizes.map(s => <p key={s} className="crit">{s} <input key={`${p.id}-${s}-${p.stock[s]}`} type="number" min={0} defaultValue={p.stock[s]} aria-label={`Stock ${p.name} ${s}`} onBlur={e => +e.target.value !== p.stock[s] && stock(p, s, Math.max(0, Math.floor(+e.target.value)))} /></p>)}</div>)}</div>}
  </section>
}

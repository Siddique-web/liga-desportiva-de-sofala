import { useEffect, useMemo, useState } from 'react'
import { api, enviar, mt, type Config, type Produto } from './api'

const VISTAS = ['Frente', 'Costas', 'Detalhe'] as const
function Art({ p, v = 0 }: { p: Produto; v?: number }) {
  const { color: c, accent: a } = p
  return <svg viewBox="0 0 200 200" role="img" aria-label={`${p.name} — ${VISTAS[v]}`}>
    <rect width="200" height="200" fill="#0b140e" />
    {p.kind === 'jersey' && <g>
      <path d="M60 30 L20 55 L38 90 L55 80 L55 175 L145 175 L145 80 L162 90 L180 55 L140 30 Q100 55 60 30Z" fill={c} stroke={a} strokeWidth="3" />
      {v === 0 && <><path d="M72 30 Q100 62 128 30" fill="none" stroke={a} strokeWidth="5" /><circle cx="122" cy="85" r="9" fill={a} opacity=".85" /></>}
      {v === 1 && <text x="100" y="120" textAnchor="middle" fontSize="54" fontFamily="Impact" fill={a}>10</text>}
      {v === 2 && <><path d="M20 55 L38 90" stroke={a} strokeWidth="9" /><path d="M180 55 L162 90" stroke={a} strokeWidth="9" /><text x="100" y="120" textAnchor="middle" fontSize="20" fontFamily="Impact" fill={a}>L.D.S</text></>}
    </g>}
    {p.kind === 'scarf' && <g>{[0, 1, 2, 3, 4, 5].map(i => <rect key={i} x={v === 2 ? 20 + i * 27 : 70} y={v === 2 ? 40 : 15 + i * 28} width={v === 2 ? 27 : 60} height={v === 2 ? 120 : 28} fill={i % 2 ? a : c} stroke={a} />)}<text x="100" y="105" textAnchor="middle" fontSize="16" fontFamily="Impact" fill="#00ff66">{v === 1 ? '' : 'L.D.S'}</text></g>}
    {p.kind === 'cap' && <g><path d="M40 120 Q40 50 100 50 Q160 50 160 120Z" fill={c} stroke={a} strokeWidth="3" /><path d="M40 120 Q100 150 175 125 L160 112 Z" fill={a} opacity=".9" /><text x="100" y="100" textAnchor="middle" fontSize="22" fontFamily="Impact" fill={a}>{v === 1 ? '' : 'LDS'}</text></g>}
  </svg>
}
const Img = ({ p, v }: { p: Produto; v: number }) => p.images[v] ? <img src={p.images[v]} alt={p.name} /> : <Art p={p} v={v} />

interface Linha { id: number; size: string; qty: number }
interface Resumo { code: string; total: number; items: { name: string; size: string; qty: number; price: number }[] }

export default function Loja() {
  const [prods, setProds] = useState<Produto[]>([]), [cfg, setCfg] = useState<Config | null>(null)
  const [sel, setSel] = useState<Produto | null>(null), [v, setV] = useState(0), [size, setSize] = useState('')
  const [cart, setCart] = useState<Linha[]>(() => { try { return JSON.parse(localStorage.getItem('lds-cart') || '[]') } catch { return [] } })
  const [step, setStep] = useState<'loja' | 'checkout' | 'fim'>('loja'), [erro, setErro] = useState(''), [busy, setBusy] = useState(false)
  const [f, setF] = useState({ name: '', phone: '', email: '', address: '', city: 'Beira', method: 'M-Pesa' })
  const [res, setRes] = useState<Resumo | null>(null), [proof, setProof] = useState('')
  useEffect(() => { api<Produto[]>('/api/products').then(setProds).catch(e => setErro(e.message)); api<Config>('/api/config').then(setCfg) }, [])
  useEffect(() => localStorage.setItem('lds-cart', JSON.stringify(cart)), [cart])
  const byId = (id: number) => prods.find(p => p.id === id)
  const total = useMemo(() => cart.reduce((s, l) => s + (byId(l.id)?.price || 0) * l.qty, 0), [cart, prods])
  const abrir = (p: Produto) => { setSel(p); setV(0); setSize(p.sizes.find(s => p.stock[s] > 0) || ''); setErro('') }
  const add = () => { if (!sel || !size) return; setCart(c => { const i = c.findIndex(l => l.id === sel.id && l.size === size); const q = Math.min((c[i]?.qty || 0) + 1, sel.stock[size]); return i < 0 ? [...c, { id: sel.id, size, qty: 1 }] : c.map((l, k) => k === i ? { ...l, qty: q } : l) }); setSel(null) }
  const mudar = (i: number, d: number) => setCart(c => c.map((l, k) => k === i ? { ...l, qty: l.qty + d } : l).filter(l => l.qty > 0))
  const ok = f.name.trim().length > 2 && /^\+?[0-9\s]{9,15}$/.test(f.phone.trim()) && f.address.trim().length > 4 && f.city.trim()

  async function finalizar() {
    setBusy(true); setErro('')
    try { const r = await api<Resumo>('/api/orders', 'POST', { ...f, items: cart }); setRes(r); setCart([]); setStep('fim') } catch (e: any) { setErro(e.message) }
    setBusy(false)
  }
  async function enviarProva(file?: File) {
    if (!file || !res) return; setProof('A enviar…')
    const fd = new FormData(); fd.append('proof', file)
    try { await enviar(`/api/orders/${res.code}/proof`, fd); setProof('✔ Comprovativo recebido. Vamos validar o pagamento.') } catch (e: any) { setProof('✖ ' + e.message) }
  }
  const wa = res && cfg ? `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(`Olá! Segue o comprovativo da encomenda ${res.code} (${mt(res.total)}) — ${f.name}.`)}` : '#'
  const ref = f.method === 'M-Pesa' ? `M-Pesa: ${cfg?.mpesa}` : f.method === 'e-Mola' ? `e-Mola: ${cfg?.emola}` : `NIB: ${cfg?.nib}`

  if (step === 'fim' && res) return <section className="shop">
    <h2>Encomenda <span>registada</span></h2>
    <div className="card ok-card"><p>Código da encomenda: <b className="code">{res.code}</b></p>
      <ul>{res.items.map((i, k) => <li key={k}>{i.qty}× {i.name} ({i.size}) — {mt(i.price * i.qty)}</li>)}</ul>
      <p>Total a pagar: <b>{mt(res.total)}</b></p><hr />
      <h3>Como pagar</h3>
      <ol><li>Faça o pagamento de <b>{mt(res.total)}</b> por <b>{f.method}</b> — {ref}{f.method === 'Transferência bancária' ? ` (${cfg?.holder})` : ` (${cfg?.holder})`}.</li>
        <li>Use <b>{res.code}</b> como referência/descrição.</li><li>Envie o comprovativo abaixo ou por WhatsApp.</li></ol>
      <label className="file">Enviar comprovativo (PDF/imagem)<input type="file" accept="application/pdf,image/*" onChange={e => enviarProva(e.target.files?.[0])} /></label>
      {proof && <p className="msg">{proof}</p>}
      <a className="btn p" href={wa} target="_blank" rel="noreferrer">Enviar por WhatsApp</a><a className="btn" href="#/loja" onClick={() => { setStep('loja'); setRes(null) }}>Voltar à loja</a>
      <p className="hint">Guarde o código. Após validarmos o pagamento, a encomenda segue para entrega.</p></div></section>

  if (step === 'checkout') return <section className="shop">
    <h2>Fina<span>lizar</span></h2>
    <div className="two"><form className="card form" onSubmit={e => { e.preventDefault(); ok && finalizar() }}>
      <label>Nome completo<input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required /></label>
      <label>Telefone / WhatsApp<input inputMode="tel" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} required /></label>
      <label>E-mail (opcional)<input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></label>
      <label>Morada de entrega<input value={f.address} onChange={e => setF({ ...f, address: e.target.value })} required /></label>
      <label>Cidade<input value={f.city} onChange={e => setF({ ...f, city: e.target.value })} required /></label>
      <fieldset><legend>Pagamento local</legend>{['M-Pesa', 'e-Mola', 'Transferência bancária'].map(m => <label key={m} className="radio"><input type="radio" name="m" checked={f.method === m} onChange={() => setF({ ...f, method: m })} />{m}</label>)}</fieldset>
      {erro && <p className="err">{erro}</p>}
      <button className="btn p" disabled={!ok || busy}>{busy ? 'A registar…' : `Confirmar encomenda — ${mt(total)}`}</button>
      <button type="button" className="btn" onClick={() => setStep('loja')}>Voltar</button></form>
      <div className="card"><h3>Resumo</h3>{cart.map((l, i) => { const p = byId(l.id); return p && <p key={i}>{l.qty}× {p.name} ({l.size}) <b>{mt(p.price * l.qty)}</b></p> })}<p>Total: <b>{mt(total)}</b></p></div></div></section>

  return <section className="shop">
    <h2 className="scroll-fx">Loja <span>Oficial</span></h2><p className="sub scroll-fx">Merchandising oficial da L.D.S. Pague por M-Pesa, e-Mola ou transferência — sem cartão.</p>
    {erro && <p className="err">{erro}</p>}
    <div className="prods">{prods.map(p => { const n = Object.values(p.stock).reduce((a, b) => a + b, 0); return <button key={p.id} className="prod scroll-fx" onClick={() => abrir(p)}>
      <Img p={p} v={0} /><h3>{p.name}</h3><b>{mt(p.price)}</b><small className={n < 6 ? 'low' : ''}>{n === 0 ? 'Esgotado' : n < 6 ? `Últimas ${n} unidades` : 'Em stock'}</small></button> })}</div>

    {cart.length > 0 && <div className="cartbar"><span>{cart.reduce((s, l) => s + l.qty, 0)} artigo(s) · <b>{mt(total)}</b></span>
      <button className="btn p" onClick={() => setStep('checkout')}>Finalizar</button>
      <details><summary>Ver carrinho</summary>{cart.map((l, i) => { const p = byId(l.id); return p && <p key={i}>{p.name} ({l.size}) <button onClick={() => mudar(i, -1)}>−</button> {l.qty} <button onClick={() => mudar(i, 1)} disabled={l.qty >= (p.stock[l.size] || 0)}>+</button></p> })}</details></div>}

    {sel && <div className="modal on" onClick={e => e.target === e.currentTarget && setSel(null)}><div className="mb pd">
      <div className="gal"><Img p={sel} v={v} /><div className="thumbs">{(sel.images.length ? sel.images.map((_, i) => `Foto ${i + 1}`) : [...VISTAS]).map((n, i) => <button key={n} className={i === v ? 'on' : ''} onClick={() => setV(i)} aria-label={n}><Img p={sel} v={i} /></button>)}</div></div>
      <div className="info"><h3>{sel.name}</h3><b className="pr">{mt(sel.price)}</b><p>{sel.descr}</p>
        <div className="sizes" role="radiogroup" aria-label="Tamanho">{sel.sizes.map(s => <button key={s} disabled={sel.stock[s] <= 0} className={s === size ? 'on' : ''} onClick={() => setSize(s)}>{s}</button>)}</div>
        <small>{size ? (sel.stock[size] > 0 ? `${sel.stock[size]} em stock no tamanho ${size}` : 'Esgotado') : 'Esgotado'}</small>
        <button className="btn p" disabled={!size} onClick={add}>Adicionar ao carrinho</button><button className="btn" onClick={() => setSel(null)}>Fechar</button></div></div></div>}
  </section>
}

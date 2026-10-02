import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, enviar, mt } from './api'
import { loadCart, saveCart } from './cart'
import type { Config, Linha, Produto } from './types'

const VISTAS = ['Frente', 'Costas', 'Detalhe'] as const
const MAX_QTY = 10 // limite por linha — o servidor rejeita mais do que isto
const PHONE = /^\+?[0-9\s]{9,15}$/
const EMAIL = /^\S+@\S+\.\S+$/
const METODOS = ['M-Pesa', 'e-Mola', 'Transferência bancária'] as const

/** Unidades que se podem comprar de um tamanho (stock ∩ limite por linha). */
const limite = (p: Produto, size: string) => Math.max(0, Math.min(p.stock[size] ?? 0, MAX_QTY))
const totalStock = (p: Produto) => Object.values(p.stock).reduce((a, b) => a + b, 0)

// Ilustração SVG usada quando o produto não tem fotografia (ou a foto falha a carregar)
function Art({ p, v = 0 }: { p: Produto; v?: number }) {
  const { color: c, accent: a } = p
  const w = v % VISTAS.length
  return <svg viewBox="0 0 200 200" role="img" aria-label={`${p.name} — ${VISTAS[w]}`}>
    <rect width="200" height="200" fill="#0b140e" />
    {p.kind === 'jersey' && <g>
      <path d="M60 30 L20 55 L38 90 L55 80 L55 175 L145 175 L145 80 L162 90 L180 55 L140 30 Q100 55 60 30Z" fill={c} stroke={a} strokeWidth="3" />
      {w === 0 && <><path d="M72 30 Q100 62 128 30" fill="none" stroke={a} strokeWidth="5" /><circle cx="122" cy="85" r="9" fill={a} opacity=".85" /></>}
      {w === 1 && <text x="100" y="120" textAnchor="middle" fontSize="54" fontFamily="Impact" fill={a}>10</text>}
      {w === 2 && <><path d="M20 55 L38 90" stroke={a} strokeWidth="9" /><path d="M180 55 L162 90" stroke={a} strokeWidth="9" /><text x="100" y="120" textAnchor="middle" fontSize="20" fontFamily="Impact" fill={a}>L.D.S</text></>}
    </g>}
    {p.kind === 'scarf' && <g>{[0, 1, 2, 3, 4, 5].map(i => <rect key={i} x={w === 2 ? 20 + i * 27 : 70} y={w === 2 ? 40 : 15 + i * 28} width={w === 2 ? 27 : 60} height={w === 2 ? 120 : 28} fill={i % 2 ? a : c} stroke={a} />)}<text x="100" y="105" textAnchor="middle" fontSize="16" fontFamily="Impact" fill="#00ff66">{w === 1 ? '' : 'L.D.S'}</text></g>}
    {p.kind === 'cap' && <g><path d="M40 120 Q40 50 100 50 Q160 50 160 120Z" fill={c} stroke={a} strokeWidth="3" /><path d="M40 120 Q100 150 175 125 L160 112 Z" fill={a} opacity=".9" /><text x="100" y="100" textAnchor="middle" fontSize="22" fontFamily="Impact" fill={a}>{w === 1 ? '' : 'LDS'}</text></g>}
  </svg>
}

function Img({ p, v }: { p: Produto; v: number }) {
  const src = p.images[v]
  const [falhou, setFalhou] = useState(false)
  useEffect(() => { setFalhou(false) }, [src])
  return src && !falhou
    ? <img src={src} alt={`${p.name} — foto ${v + 1}`} loading="lazy" onError={() => setFalhou(true)} />
    : <Art p={p} v={v} />
}

interface Resumo { code: string; total: number; items: { name: string; size: string; qty: number; price: number }[] }

export default function Loja() {
  const [prods, setProds] = useState<Produto[] | null>(null) // null = a carregar
  const [cfg, setCfg] = useState<Config | null>(null)
  const [sel, setSel] = useState<Produto | null>(null)
  const [v, setV] = useState(0)
  const [size, setSize] = useState('')
  const [cart, setCart] = useState<Linha[]>(loadCart)
  const [step, setStep] = useState<'loja' | 'checkout' | 'fim'>('loja')
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [busy, setBusy] = useState(false)
  const [f, setF] = useState({ name: '', phone: '', email: '', address: '', city: 'Beira', method: METODOS[0] as string })
  const [res, setRes] = useState<Resumo | null>(null)
  const [proof, setProof] = useState('')

  const carregar = useCallback(() => {
    return api<Produto[]>('/api/products')
      .then(d => { setProds(Array.isArray(d) ? d : []); setErro('') })
      .catch((e: Error) => { setProds(p => p ?? []); setErro(e.message || 'Não foi possível carregar os artigos.') })
  }, [])
  useEffect(() => {
    carregar()
    api<Config>('/api/config').then(setCfg).catch(() => { /* sem config: as instruções de pagamento ficam genéricas */ })
  }, [carregar])

  // Persistir o carrinho (e avisar a barra de navegação)
  useEffect(() => { saveCart(cart) }, [cart])

  // Ajustar o carrinho guardado ao stock real: remove artigos que já não existem e limita quantidades
  useEffect(() => {
    if (!prods || prods.length === 0) return
    setCart(c => {
      const novo: Linha[] = []
      for (const l of c) {
        const p = prods.find(x => x.id === l.id)
        if (!p || !p.sizes.includes(l.size)) continue
        const q = Math.min(l.qty, limite(p, l.size))
        if (q > 0) novo.push({ ...l, qty: q })
      }
      const igual = novo.length === c.length && novo.every((l, i) => l.id === c[i].id && l.size === c[i].size && l.qty === c[i].qty)
      if (!igual) setAviso('O carrinho foi ajustado ao stock disponível.')
      return igual ? c : novo
    })
  }, [prods])

  const byId = useCallback((id: number) => prods?.find(p => p.id === id), [prods])
  const total = useMemo(() => cart.reduce((s, l) => s + (byId(l.id)?.price || 0) * l.qty, 0), [cart, byId])
  const qtd = useMemo(() => cart.reduce((s, l) => s + l.qty, 0), [cart])

  // Modal do produto: Esc fecha e o scroll da página fica bloqueado
  useEffect(() => {
    if (!sel) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setSel(null) }
    const antes = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', k)
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = antes }
  }, [sel])
  useEffect(() => { window.scrollTo(0, 0) }, [step])

  const abrir = (p: Produto) => { setSel(p); setV(0); setSize(p.sizes.find(s => limite(p, s) > 0) || ''); setAviso('') }
  const add = () => {
    if (!sel || !size) return
    const max = limite(sel, size)
    const atual = cart.find(l => l.id === sel.id && l.size === size)?.qty || 0
    if (atual >= max) { setAviso(`Já tem no carrinho todas as unidades disponíveis de ${sel.name} (${size}).`); setSel(null); return }
    setAviso('')
    setCart(c => c.some(l => l.id === sel.id && l.size === size)
      ? c.map(l => (l.id === sel.id && l.size === size ? { ...l, qty: l.qty + 1 } : l))
      : [...c, { id: sel.id, size, qty: 1 }])
    setSel(null)
  }
  const mudar = (i: number, d: number) => setCart(c => c.map((l, k) => {
    if (k !== i) return l
    const p = byId(l.id)
    return { ...l, qty: Math.min(l.qty + d, p ? limite(p, l.size) : l.qty) }
  }).filter(l => l.qty > 0))
  const remover = (i: number) => setCart(c => c.filter((_, k) => k !== i))

  const valido = f.name.trim().length > 2 && PHONE.test(f.phone.trim()) && f.address.trim().length > 4 && f.city.trim().length > 1
    && (f.email.trim() === '' || EMAIL.test(f.email.trim()))

  async function finalizar() {
    if (busy || !valido || cart.length === 0) return
    setBusy(true); setErro('')
    try {
      const r = await api<Resumo>('/api/orders', 'POST', { ...f, items: cart })
      setRes(r); setCart([]); setProof(''); setStep('fim'); carregar()
    } catch (e) {
      setErro((e as Error).message)
      carregar() // o stock pode ter mudado: atualiza e ajusta o carrinho
    }
    setBusy(false)
  }
  async function enviarProva(file?: File) {
    if (!file || !res) return
    if (file.size > 5 * 1024 * 1024) { setProof('✖ Ficheiro acima de 5 MB.'); return }
    setProof('A enviar…')
    const fd = new FormData(); fd.append('proof', file)
    try { await enviar(`/api/orders/${res.code}/proof`, fd); setProof('✔ Comprovativo recebido. Vamos validar o pagamento.') } catch (e) { setProof('✖ ' + (e as Error).message) }
  }

  const wa = res && cfg?.whatsapp ? `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(`Olá! Segue o comprovativo da encomenda ${res.code} (${mt(res.total)}) — ${f.name}.`)}` : ''
  const ref = f.method === 'M-Pesa' ? `M-Pesa: ${cfg?.mpesa || 'número a confirmar por WhatsApp'}`
    : f.method === 'e-Mola' ? `e-Mola: ${cfg?.emola || 'número a confirmar por WhatsApp'}`
    : `NIB: ${cfg?.nib || 'a confirmar por WhatsApp'}`

  // ---------- 3. Encomenda registada ----------
  if (step === 'fim' && res) return <section className="shop">
    <h2>Encomenda <span>registada</span></h2>
    <div className="card ok-card"><p>Código da encomenda: <b className="code">{res.code}</b></p>
      <ul>{res.items.map((i, k) => <li key={k}>{i.qty}× {i.name} ({i.size}) — {mt(i.price * i.qty)}</li>)}</ul>
      <p>Total a pagar: <b>{mt(res.total)}</b></p><hr />
      <h3>Como pagar</h3>
      <ol><li>Faça o pagamento de <b>{mt(res.total)}</b> por <b>{f.method}</b> — {ref}{cfg?.holder ? ` (${cfg.holder})` : ''}.</li>
        <li>Use <b>{res.code}</b> como referência/descrição.</li><li>Envie o comprovativo abaixo{wa ? ' ou por WhatsApp' : ''}.</li></ol>
      <label className="file">Enviar comprovativo (PDF/imagem)<input type="file" accept="application/pdf,image/*" onChange={e => { enviarProva(e.target.files?.[0]); e.target.value = '' }} /></label>
      {proof && <p className="msg" role="status">{proof}</p>}
      {wa && <a className="btn p" href={wa} target="_blank" rel="noreferrer">Enviar por WhatsApp</a>}
      <button type="button" className="btn" onClick={() => { setStep('loja'); setRes(null) }}>Voltar à loja</button>
      <p className="hint">Guarde o código. Após validarmos o pagamento, a encomenda segue para entrega.</p></div></section>

  // ---------- 2. Finalizar ----------
  if (step === 'checkout') return <section className="shop">
    <h2>Fina<span>lizar</span></h2>
    {cart.length === 0 ? <div className="card"><p>O carrinho está vazio.</p><button type="button" className="btn p" onClick={() => setStep('loja')}>Voltar à loja</button></div> :
    <div className="two"><form className="card form" onSubmit={e => { e.preventDefault(); finalizar() }}>
      <label>Nome completo<input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required autoComplete="name" /></label>
      <label>Telefone / WhatsApp<input inputMode="tel" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} required autoComplete="tel" placeholder="84 123 4567" /></label>
      <label>E-mail (opcional)<input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} autoComplete="email" /></label>
      <label>Morada de entrega<input value={f.address} onChange={e => setF({ ...f, address: e.target.value })} required autoComplete="street-address" /></label>
      <label>Cidade<input value={f.city} onChange={e => setF({ ...f, city: e.target.value })} required autoComplete="address-level2" /></label>
      <fieldset><legend>Pagamento local</legend>{METODOS.map(m => <label key={m} className="radio"><input type="radio" name="m" checked={f.method === m} onChange={() => setF({ ...f, method: m })} />{m}</label>)}</fieldset>
      {erro && <p className="err" role="alert">{erro}</p>}
      {aviso && <p className="hint" role="status">{aviso}</p>}
      <button className="btn p" disabled={!valido || busy || total === 0}>{busy ? 'A registar…' : `Confirmar encomenda — ${mt(total)}`}</button>
      <button type="button" className="btn" onClick={() => setStep('loja')}>Voltar</button></form>
      <div className="card"><h3>Resumo</h3>{cart.map((l, i) => { const p = byId(l.id); return p && <p key={i}>{l.qty}× {p.name} ({l.size}) <b>{mt(p.price * l.qty)}</b></p> })}<p>Total: <b>{mt(total)}</b></p></div></div>}
  </section>

  // ---------- 1. Loja ----------
  return <section className="shop">
    <h2 className="scroll-fx">Loja <span>Oficial</span></h2><p className="sub scroll-fx">Merchandising oficial da L.D.S. Pague por M-Pesa, e-Mola ou transferência — sem cartão.</p>
    {erro && <div className="err" role="alert">{erro} <button type="button" className="btn" onClick={() => carregar()}>Tentar novamente</button></div>}
    {aviso && <p className="hint" role="status">{aviso}</p>}
    {prods === null && <p className="sub" role="status">A carregar artigos…</p>}
    {prods !== null && prods.length === 0 && !erro && <p className="sub">Ainda não há artigos disponíveis. Volte em breve.</p>}
    <div className="prods">{(prods ?? []).map(p => { const n = totalStock(p); return <button type="button" key={p.id} className="prod scroll-fx" onClick={() => abrir(p)}>
      <Img p={p} v={0} /><h3>{p.name}</h3><b>{mt(p.price)}</b><small className={n < 6 ? 'low' : ''}>{n === 0 ? 'Esgotado' : n < 6 ? `Últimas ${n} unidades` : 'Em stock'}</small></button> })}</div>

    {qtd > 0 && <div className="cartbar"><span>{qtd} artigo(s) · <b>{mt(total)}</b></span>
      <button type="button" className="btn p" onClick={() => setStep('checkout')} disabled={total === 0}>Finalizar</button>
      <details><summary>Ver carrinho</summary>{cart.map((l, i) => { const p = byId(l.id); return p && <p key={`${l.id}-${l.size}`}>
        {p.name} ({l.size}) <button type="button" aria-label={`Menos uma unidade de ${p.name} ${l.size}`} onClick={() => mudar(i, -1)}>−</button> {l.qty} <button type="button" aria-label={`Mais uma unidade de ${p.name} ${l.size}`} onClick={() => mudar(i, 1)} disabled={l.qty >= limite(p, l.size)}>+</button> <b>{mt(p.price * l.qty)}</b> <button type="button" aria-label={`Remover ${p.name} ${l.size}`} onClick={() => remover(i)}>✕</button></p> })}</details></div>}

    {sel && <div className="modal on" onClick={e => e.target === e.currentTarget && setSel(null)}><div className="mb pd" role="dialog" aria-modal="true" aria-label={sel.name}>
      <div className="gal"><Img p={sel} v={v} />{(sel.images.length > 1 || sel.images.length === 0) && <div className="thumbs">{(sel.images.length ? sel.images.map((_, i) => `Foto ${i + 1}`) : [...VISTAS]).map((n, i) => <button type="button" key={n} className={i === v ? 'on' : ''} onClick={() => setV(i)} aria-label={n}><Img p={sel} v={i} /></button>)}</div>}</div>
      <div className="info"><h3>{sel.name}</h3><b className="pr">{mt(sel.price)}</b><p>{sel.descr}</p>
        <div className="sizes" role="radiogroup" aria-label="Tamanho">{sel.sizes.map(s => <button type="button" key={s} role="radio" aria-checked={s === size} disabled={limite(sel, s) <= 0} className={s === size ? 'on' : ''} onClick={() => setSize(s)}>{s}</button>)}</div>
        <small>{size && limite(sel, size) > 0 ? `${sel.stock[size]} em stock no tamanho ${size}` : 'Esgotado'}</small>
        <button type="button" className="btn p" disabled={!size} onClick={add}>Adicionar ao carrinho</button><button type="button" className="btn" onClick={() => setSel(null)}>Fechar</button></div></div></div>}
  </section>
}

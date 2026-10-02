import { useEffect, useState } from 'react'
import type { Linha } from './types'

const KEY = 'lds-cart'
const EVT = 'lds-cart-change'

/** Lê o carrinho do localStorage; devolve [] se estiver corrompido ou indisponível (modo privado). */
export function loadCart(): Linha[] {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || '[]')
    if (!Array.isArray(d)) return []
    return d.filter(l => l && Number.isInteger(l.id) && typeof l.size === 'string' && Number.isInteger(l.qty) && l.qty > 0)
  } catch { return [] }
}

export function saveCart(c: Linha[]) {
  try { localStorage.setItem(KEY, JSON.stringify(c)) } catch { /* sem armazenamento: o carrinho vive só em memória */ }
  window.dispatchEvent(new Event(EVT))
}

const count = (c: Linha[]) => c.reduce((s, l) => s + l.qty, 0)

/** Nº de artigos no carrinho, sincronizado entre páginas e separadores. */
export function useCartCount() {
  const [n, setN] = useState(() => count(loadCart()))
  useEffect(() => {
    const h = () => setN(count(loadCart()))
    window.addEventListener(EVT, h)
    window.addEventListener('storage', h)
    return () => { window.removeEventListener(EVT, h); window.removeEventListener('storage', h) }
  }, [])
  return n
}

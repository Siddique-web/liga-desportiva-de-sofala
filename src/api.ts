import type { Config, Linha, Produto } from './types'

export type { Config, Linha, Produto }

export const mt = (n: number) => `${n.toLocaleString('pt-PT')} MT`

export async function api<T = any>(url: string, method = 'GET', body?: unknown): Promise<T> {
  let r: Response
  try {
    r = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Sem ligação ao servidor. Verifique a internet e tente de novo.')
  }
  const d = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(d.error || 'Erro de comunicação.')
  return d
}

// Envio multipart com progresso (ficheiros pesados)
export function enviar<T = any>(url: string, fd: FormData, onProgress?: (p: number) => void): Promise<T> {
  return new Promise((ok, ko) => {
    const x = new XMLHttpRequest()
    x.open('POST', url)
    x.upload.onprogress = e => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100))
    x.onerror = () => ko(new Error('Sem ligação ao servidor.'))
    x.onload = () => {
      let d: any = {}
      try {
        d = JSON.parse(x.responseText)
      } catch {}
      x.status < 300 ? ok(d) : ko(new Error(d.error || 'Erro no envio.'))
    }
    x.send(fd)
  })
}
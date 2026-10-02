import { useState } from 'react'
import { enviar } from './api'
import { POSICOES, VAZIO, validar, type Errors, type ScoutingForm } from './validation'

export default function Recrutamento() {
  const [f, setF] = useState<ScoutingForm>(VAZIO), [e, setE] = useState<Errors>({}), [p, setP] = useState(0)
  const [st, setSt] = useState<'idle' | 'busy' | 'ok' | 'err'>('idle'), [msg, setMsg] = useState('')
  const set = <K extends keyof ScoutingForm>(k: K, v: ScoutingForm[K]) => { setF(x => ({ ...x, [k]: v })); setE(x => ({ ...x, [k]: undefined })) }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault()
    const er = validar(f); setE(er)
    if (Object.keys(er).length) { setSt('err'); setMsg('Corrija os campos assinalados.'); document.querySelector('.invalid')?.scrollIntoView({ block: 'center' }); return }
    const fd = new FormData()
    ;(['nome', 'nascimento', 'telefone', 'email', 'morada', 'pos1', 'pos2', 'clubes', 'experiencia'] as const).forEach(k => fd.append(k, f[k]))
    fd.append('cv', f.cv!); fd.append('foto', f.foto!)
    if (f.video) fd.append('video', f.video); else fd.append('videoUrl', f.videoUrl.trim())
    setSt('busy'); setP(0)
    try { await enviar('/api/athletes', fd, setP); setSt('ok'); setF(VAZIO) } catch (x: any) { setSt('err'); setMsg(x.message) }
  }
  const T = (k: 'nome' | 'telefone' | 'email' | 'morada' | 'clubes', l: string, t = 'text') =>
    <label className={e[k] ? 'invalid' : ''}>{l}<input type={t} value={f[k]} onChange={x => set(k, x.target.value)} />{e[k] && <em>{e[k]}</em>}</label>
  const S = (k: 'pos1' | 'pos2', l: string) =>
    <label className={e[k] ? 'invalid' : ''}>{l}<select value={f[k]} onChange={x => set(k, x.target.value as ScoutingForm['pos1'])}><option value="">Selecione…</option>{POSICOES.map(o => <option key={o}>{o}</option>)}</select>{e[k] && <em>{e[k]}</em>}</label>
  const F = (k: 'cv' | 'foto' | 'video', l: string, acc: string) =>
    <label className={'file' + (e[k] ? ' invalid' : '')}>{l}<input type="file" accept={acc} onChange={x => set(k, x.target.files?.[0] || null)} />{f[k] && <small>{f[k]!.name}</small>}{e[k] && <em>{e[k]}</em>}</label>

  if (st === 'ok') return <section className="shop"><div className="card ok-card"><h2>Candidatura <span>enviada!</span></h2><p>Recebemos os seus dados. Enviámos uma confirmação para o seu e-mail e será avisado de cada atualização do processo.</p><a className="btn p" href="#/">Voltar ao início</a></div></section>
  return <section className="shop">
    <h2 className="scroll-fx">Faça parte da <span>L.D.S.</span></h2><p className="sub scroll-fx">Portal de recrutamento e scouting. A equipa técnica de Mussa Osman avalia todas as candidaturas.</p>
    <form className="card form scroll-fx fx-soft" onSubmit={submit} noValidate>
      <h3>Dados pessoais</h3>{T('nome', 'Nome completo')}<div className="row2">{(() => <label className={e.nascimento ? 'invalid' : ''}>Data de nascimento<input type="date" value={f.nascimento} onChange={x => set('nascimento', x.target.value)} />{e.nascimento && <em>{e.nascimento}</em>}</label>)()}{T('telefone', 'Telefone', 'tel')}</div>
      {T('email', 'E-mail', 'email')}{T('morada', 'Morada')}
      <h3>Futebol</h3><div className="row2">{S('pos1', 'Posição principal')}{S('pos2', 'Posição secundária')}</div>
      {T('clubes', 'Clubes anteriores (separe por vírgulas)')}
      <label className={e.experiencia ? 'invalid' : ''}>Anos de experiência<input type="number" min={0} max={30} value={f.experiencia} onChange={x => set('experiencia', x.target.value)} />{e.experiencia && <em>{e.experiencia}</em>}</label>
      <h3>Documentos</h3>{F('cv', 'Currículo (PDF, máx. 5 MB)', 'application/pdf')}{F('foto', 'Foto profissional (JPG/PNG, máx. 3 MB)', 'image/jpeg,image/png,image/webp')}
      <h3>Vídeo de destaques (2 min)</h3>{F('video', 'Ficheiro de vídeo (MP4/WEBM/MOV, máx. 100 MB)', 'video/mp4,video/webm,video/quicktime')}
      <p className="hint">… ou, se preferir, cole um link:</p>
      <label className={e.videoUrl ? 'invalid' : ''}>Link YouTube / Google Drive<input type="url" value={f.videoUrl} disabled={!!f.video} onChange={x => set('videoUrl', x.target.value)} placeholder="https://" />{e.videoUrl && <em>{e.videoUrl}</em>}</label>
      {st === 'err' && <p className="err" role="alert">{msg}</p>}
      {st === 'busy' && <div className="bar" role="progressbar" aria-valuenow={p}><i style={{ width: p + '%' }} /><span>{p < 100 ? `A enviar… ${p}%` : 'A processar…'}</span></div>}
      <button className="btn p" disabled={st === 'busy'}>Enviar candidatura</button>
    </form></section>
}

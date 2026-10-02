export const POSICOES = ['Guarda-redes', 'Defesa Central', 'Lateral Direito', 'Lateral Esquerdo', 'Médio Defensivo', 'Médio Centro', 'Médio Ofensivo', 'Extremo', 'Ponta de Lança'] as const
export type Posicao = (typeof POSICOES)[number]

export interface ScoutingForm {
  nome: string; nascimento: string; telefone: string; email: string; morada: string
  pos1: Posicao | ''; pos2: Posicao | ''; clubes: string; experiencia: string
  cv: File | null; foto: File | null; video: File | null; videoUrl: string
}
export type Errors = Partial<Record<keyof ScoutingForm, string>>
export const VAZIO: ScoutingForm = { nome: '', nascimento: '', telefone: '', email: '', morada: '', pos1: '', pos2: '', clubes: '', experiencia: '', cv: null, foto: null, video: null, videoUrl: '' }

const MB = 1024 * 1024
export const LIMITES = { cv: 5 * MB, foto: 3 * MB, video: 100 * MB }
const idade = (iso: string) => { const d = new Date(iso), h = new Date(); let a = h.getFullYear() - d.getFullYear(); if (h < new Date(h.getFullYear(), d.getMonth(), d.getDate())) a--; return a }

export function validar(f: ScoutingForm): Errors {
  const e: Errors = {}
  if (f.nome.trim().split(/\s+/).length < 2) e.nome = 'Indique o nome completo.'
  if (!f.nascimento || isNaN(Date.parse(f.nascimento))) e.nascimento = 'Data inválida.'
  else if (idade(f.nascimento) < 14 || idade(f.nascimento) > 45) e.nascimento = 'Idade permitida: 14 a 45 anos.'
  if (!/^\+?[0-9\s]{9,15}$/.test(f.telefone.trim())) e.telefone = 'Telefone inválido (ex.: 84 123 4567).'
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'E-mail inválido.'
  if (f.morada.trim().length < 5) e.morada = 'Indique a morada.'
  if (!f.pos1) e.pos1 = 'Escolha a posição principal.'
  if (!f.pos2) e.pos2 = 'Escolha a posição secundária.'
  else if (f.pos1 === f.pos2) e.pos2 = 'Deve ser diferente da principal.'
  const x = Number(f.experiencia)
  if (f.experiencia === '' || !Number.isInteger(x) || x < 0 || x > 30) e.experiencia = 'Anos de experiência: 0 a 30.'
  if (!f.cv) e.cv = 'Anexe o currículo em PDF.'
  else if (f.cv.type !== 'application/pdf') e.cv = 'O currículo tem de ser PDF.'
  else if (f.cv.size > LIMITES.cv) e.cv = 'PDF acima de 5 MB.'
  if (!f.foto) e.foto = 'Anexe uma foto profissional.'
  else if (!/^image\/(jpeg|png|webp)$/.test(f.foto.type)) e.foto = 'Use JPG, PNG ou WEBP.'
  else if (f.foto.size > LIMITES.foto) e.foto = 'Foto acima de 3 MB.'
  if (f.video) { if (!/^video\/(mp4|webm|quicktime)$/.test(f.video.type)) e.video = 'Use MP4, WEBM ou MOV.'; else if (f.video.size > LIMITES.video) e.video = 'Vídeo acima de 100 MB — use um link.' }
  else if (!/^https:\/\/(www\.)?(youtube\.com|youtu\.be|drive\.google\.com)\//.test(f.videoUrl.trim())) e.videoUrl = 'Envie um vídeo ou cole um link do YouTube / Google Drive.'
  return e
}

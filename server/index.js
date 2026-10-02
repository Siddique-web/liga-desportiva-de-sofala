import express from 'express'
import multer from 'multer'
import nodemailer from 'nodemailer'
import Database from 'better-sqlite3'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
try { process.loadEnvFile(path.join(root, '.env')) } catch {}
const E = process.env
const SECRET = E.SESSION_SECRET || crypto.randomBytes(32).toString('hex')
const UP = path.join(root, 'data', 'uploads')
fs.mkdirSync(UP, { recursive: true })

// ---------- Base de dados ----------
const db = new Database(path.join(root, 'data', 'lds.db'))
db.pragma('journal_mode = WAL')
db.exec(`
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, email TEXT UNIQUE, name TEXT, pass TEXT, role TEXT DEFAULT 'coach');
CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY, name TEXT, kind TEXT, color TEXT, accent TEXT, descr TEXT, price INTEGER, sizes TEXT, stock TEXT, images TEXT DEFAULT '[]');
CREATE TABLE IF NOT EXISTS orders(id INTEGER PRIMARY KEY, code TEXT UNIQUE, name TEXT, phone TEXT, email TEXT, address TEXT, city TEXT, method TEXT, items TEXT, total INTEGER, status TEXT DEFAULT 'Aguarda pagamento', proof TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS athletes(id INTEGER PRIMARY KEY, nome TEXT, nascimento TEXT, telefone TEXT, email TEXT, morada TEXT, pos1 TEXT, pos2 TEXT, clubes TEXT, experiencia INTEGER, cv TEXT, foto TEXT, video_file TEXT, video_url TEXT, status TEXT DEFAULT 'Em Análise', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS evaluations(athlete_id INTEGER, user_id INTEGER, velocidade INTEGER, tecnica INTEGER, visao INTEGER, fisica INTEGER, nota TEXT, updated_at TEXT, PRIMARY KEY(athlete_id,user_id));
CREATE TABLE IF NOT EXISTS notifications(id INTEGER PRIMARY KEY, athlete_id INTEGER, to_email TEXT, subject TEXT, body TEXT, sent INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
`)
const hash = (p, salt = crypto.randomBytes(16).toString('hex')) => `${salt}:${crypto.scryptSync(p, salt, 64).toString('hex')}`
const check = (p, h) => { const [s, k] = h.split(':'); return crypto.timingSafeEqual(Buffer.from(k, 'hex'), crypto.scryptSync(p, s, 64)) }
if (!db.prepare('SELECT 1 FROM users').get()) {
  const email = E.ADMIN_EMAIL || 'mussa@lds.co.mz', pw = E.ADMIN_PASSWORD || 'mudar-esta-senha'
  db.prepare('INSERT INTO users(email,name,pass,role) VALUES(?,?,?,?)').run(email, 'Mussa Osman', hash(pw), 'admin')
  console.log(`[seed] Treinador criado: ${email}${E.ADMIN_PASSWORD ? '' : ' / senha: mudar-esta-senha  (MUDE no .env!)'}`)
}
if (!db.prepare('SELECT 1 FROM products').get()) {
  const T = ['S', 'M', 'L', 'XL', 'XXL'], st = (n) => JSON.stringify(Object.fromEntries(T.map(s => [s, n])))
  const ins = db.prepare('INSERT INTO products(name,kind,color,accent,descr,price,sizes,stock) VALUES(?,?,?,?,?,?,?,?)')
  ins.run('Camisola Principal 26/27', 'jersey', '#1e4d2b', '#ffffff', 'Camisola oficial verde, tecido respirável de secagem rápida, emblema bordado e gola em V. Corte desportivo unissexo. Primeiro lote com stock limitado.', 1500, JSON.stringify(T), st(12))
  ins.run('Camisola Alternativa 26/27', 'jersey', '#f4f7f4', '#1e4d2b', 'Camisola oficial branca com detalhes verdes. Tecido leve, ideal para dias quentes na Beira. Primeiro lote com stock limitado.', 1500, JSON.stringify(T), st(10))
  ins.run('Cachecol Verde e Branco', 'scarf', '#1e4d2b', '#ffffff', 'Cachecol de adepto em malha dupla, com o nome do clube em jacquard. Ideal para dias de jogo.', 600, '["Único"]', '{"Único":25}')
  ins.run('Boné L.D.S.', 'cap', '#1e4d2b', '#ffffff', 'Boné de aba curva com logótipo bordado e fecho ajustável.', 500, '["Único"]', '{"Único":30}')
}
// Fotos reais dos equipamentos (public/img). Só preenche produtos que ainda não têm imagens.
{
  const FOTOS = { 'Camisola Principal 26/27': ['/img/loja-verde.png', '/img/feira.png'], 'Camisola Alternativa 26/27': ['/img/loja-branca.png', '/img/feira.png'] }
  const upd = db.prepare("UPDATE products SET images=? WHERE name=? AND (images IS NULL OR images='[]')")
  for (const [n, imgs] of Object.entries(FOTOS)) upd.run(JSON.stringify(imgs), n)
}

// ---------- Utilitários ----------
const b64 = (s) => Buffer.from(s).toString('base64url')
const sign = (d) => crypto.createHmac('sha256', SECRET).update(d).digest('base64url')
const token = (u) => { const p = b64(JSON.stringify({ id: u.id, exp: Date.now() + 8 * 3600e3 })); return `${p}.${sign(p)}` }
const cookie = (req, n) => (req.headers.cookie || '').split(/;\s*/).map(c => c.split('=')).find(c => c[0] === n)?.[1]
function auth(req, res, next) {
  const t = cookie(req, 'lds'); const [p, s] = (t || '').split('.')
  try {
    if (!p || s !== sign(p)) throw 0
    const d = JSON.parse(Buffer.from(p, 'base64url')); if (d.exp < Date.now()) throw 0
    req.user = db.prepare('SELECT id,email,name,role FROM users WHERE id=?').get(d.id); if (!req.user) throw 0
    next()
  } catch { res.status(401).json({ error: 'Sessão inválida. Faça login.' }) }
}
const fails = new Map()
const mail = E.SMTP_HOST ? nodemailer.createTransport({ host: E.SMTP_HOST, port: +E.SMTP_PORT || 587, auth: E.SMTP_USER ? { user: E.SMTP_USER, pass: E.SMTP_PASS } : undefined }) : null
async function notify(athlete, subject, body) {
  let sent = 0
  try { if (mail) { await mail.sendMail({ from: E.MAIL_FROM, to: athlete.email, subject, text: body }); sent = 1 } else console.log(`[email simulado] ${athlete.email}: ${subject}`) }
  catch (e) { console.error('[email] falhou:', e.message) }
  db.prepare('INSERT INTO notifications(athlete_id,to_email,subject,body,sent) VALUES(?,?,?,?,?)').run(athlete.id, athlete.email, subject, body, sent)
}
const MSG = {
  'Convocado para Testes': (a) => ['Parabéns! Foi convocado para testes na L.D.S.', `Olá ${a.nome},\n\nParabéns! A equipa técnica da Liga Desportiva de Sofala analisou o seu perfil e convocou-o para testes. Entraremos em contacto com a data, hora e local.\n\nMussa Osman, Director Técnico, e equipa técnica`],
  'Rejeitado': (a) => ['Atualização do seu processo na L.D.S.', `Olá ${a.nome},\n\nAgradecemos o seu interesse. Após análise, neste momento não será possível avançar com a sua candidatura. Desejamos-lhe muito sucesso e pode candidatar-se novamente no futuro.\n\nEquipa técnica L.D.S.`],
  'Em Análise': (a) => ['O seu processo na L.D.S. está em análise', `Olá ${a.nome},\n\nA sua candidatura voltou ao estado "Em Análise". Avisaremos assim que houver novidades.\n\nEquipa técnica L.D.S.`],
}
const need = (o, keys) => keys.filter(k => !String(o[k] ?? '').trim())
const ext = { 'application/pdf': '.pdf', 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'video/mp4': '.mp4', 'video/webm': '.webm', 'video/quicktime': '.mov' }
const upload = multer({
  storage: multer.diskStorage({ destination: UP, filename: (_, f, cb) => cb(null, crypto.randomBytes(16).toString('hex') + (ext[f.mimetype] || '')) }),
  limits: { fileSize: 150 * 1024 * 1024, files: 3 },
  fileFilter: (_, f, cb) => {
    const ok = { cv: ['application/pdf'], foto: ['image/jpeg', 'image/png', 'image/webp'], video: ['video/mp4', 'video/webm', 'video/quicktime'], proof: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'] }[f.fieldname]
    cb(ok?.includes(f.mimetype) ? null : new Error('Tipo de ficheiro não permitido: ' + f.fieldname), !!ok?.includes(f.mimetype))
  },
})
const wipe = (files) => Object.values(files || {}).flat().forEach(f => fs.unlink(f.path, () => {}))
const MAX = { cv: 5e6, foto: 3e6, video: 100e6, proof: 5e6 }

// ---------- API ----------
const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '100kb' }))
app.use((_, res, next) => { res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'SAMEORIGIN', 'Referrer-Policy': 'same-origin' }); next() })

app.get('/api/config', (_, res) => res.json({ whatsapp: E.WHATSAPP || '', mpesa: E.MPESA_NUMBER || '', emola: E.EMOLA_NUMBER || '', nib: E.BANK_NIB || '', holder: E.BANK_HOLDER || 'Liga Desportiva de Sofala' }))
const prod = (p) => ({ ...p, sizes: JSON.parse(p.sizes), stock: JSON.parse(p.stock), images: JSON.parse(p.images) })
app.get('/api/products', (_, res) => res.json(db.prepare('SELECT * FROM products').all().map(prod)))

app.post('/api/orders', (req, res) => {
  const b = req.body || {}
  const miss = need(b, ['name', 'phone', 'address', 'city', 'method'])
  if (miss.length || !['M-Pesa', 'e-Mola', 'Transferência bancária'].includes(b.method) || !Array.isArray(b.items) || !b.items.length || b.items.length > 30)
    return res.status(400).json({ error: 'Dados da encomenda inválidos.' })
  if (!/^\+?[0-9\s]{9,15}$/.test(b.phone)) return res.status(400).json({ error: 'Telefone inválido.' })
  const tx = db.transaction(() => {
    let total = 0; const items = []
    for (const it of b.items) {
      const p = db.prepare('SELECT * FROM products WHERE id=?').get(+it.id), q = Math.floor(+it.qty)
      if (!p || !(q > 0 && q <= 10)) throw new Error('Artigo inválido.')
      const stock = JSON.parse(p.stock)
      if (!(it.size in stock)) throw new Error('Tamanho inválido.')
      if (stock[it.size] < q) throw new Error(`Sem stock suficiente: ${p.name} (${it.size}).`)
      stock[it.size] -= q; db.prepare('UPDATE products SET stock=? WHERE id=?').run(JSON.stringify(stock), p.id)
      total += p.price * q; items.push({ id: p.id, name: p.name, size: it.size, qty: q, price: p.price })
    }
    const code = 'LDS-' + crypto.randomBytes(4).toString('hex').toUpperCase()
    db.prepare('INSERT INTO orders(code,name,phone,email,address,city,method,items,total) VALUES(?,?,?,?,?,?,?,?,?)')
      .run(code, b.name.trim(), b.phone.trim(), (b.email || '').trim(), b.address.trim(), b.city.trim(), b.method, JSON.stringify(items), total)
    return { code, total, items }
  })
  try { res.status(201).json(tx()) } catch (e) { res.status(409).json({ error: e.message }) }
})
app.post('/api/orders/:code/proof', (req, res) => {
  upload.single('proof')(req, res, (err) => {
    const o = db.prepare('SELECT * FROM orders WHERE code=?').get(req.params.code)
    if (err || !o || !req.file) { wipe({ f: req.file ? [req.file] : [] }); return res.status(400).json({ error: err?.message || 'Encomenda ou ficheiro inválido.' }) }
    if (req.file.size > MAX.proof) { wipe({ f: [req.file] }); return res.status(400).json({ error: 'Comprovativo acima de 5 MB.' }) }
    db.prepare("UPDATE orders SET proof=?, status='Comprovativo recebido' WHERE id=? AND status IN ('Aguarda pagamento','Comprovativo recebido')").run(req.file.filename, o.id)
    res.json({ ok: true })
  })
})

const FIELDS = ['nome', 'nascimento', 'telefone', 'email', 'morada', 'pos1', 'pos2', 'clubes', 'experiencia']
app.post('/api/athletes', (req, res) => {
  upload.fields([{ name: 'cv', maxCount: 1 }, { name: 'foto', maxCount: 1 }, { name: 'video', maxCount: 1 }])(req, res, (err) => {
    const f = req.files || {}, b = req.body || {}, bad = (m) => { wipe(f); res.status(400).json({ error: m }) }
    if (err) return bad(err.message)
    if (need(b, FIELDS.filter(k => k !== 'clubes')).length || !f.cv || !f.foto) return bad('Preencha todos os campos obrigatórios e anexe CV e foto.')
    for (const k of Object.keys(f)) if (f[k][0].size > MAX[k]) return bad(`Ficheiro "${k}" demasiado grande.`)
    const url = (b.videoUrl || '').trim()
    if (!f.video && !/^https:\/\/(www\.)?(youtube\.com|youtu\.be|drive\.google\.com)\//.test(url)) return bad('Envie um vídeo ou um link válido (YouTube / Google Drive).')
    if (!/^\S+@\S+\.\S+$/.test(b.email) || isNaN(Date.parse(b.nascimento))) return bad('E-mail ou data de nascimento inválidos.')
    const r = db.prepare('INSERT INTO athletes(nome,nascimento,telefone,email,morada,pos1,pos2,clubes,experiencia,cv,foto,video_file,video_url) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)')
      .run(b.nome.trim(), b.nascimento, b.telefone.trim(), b.email.trim(), b.morada.trim(), b.pos1, b.pos2, (b.clubes || '').trim(), Math.max(0, +b.experiencia | 0), f.cv[0].filename, f.foto[0].filename, f.video?.[0].filename || null, f.video ? null : url)
    notify({ id: r.lastInsertRowid, nome: b.nome, email: b.email }, 'Recebemos a sua candidatura à L.D.S.', `Olá ${b.nome},\n\nRecebemos a sua candidatura. A equipa técnica irá analisá-la e será avisado por e-mail de qualquer atualização.\n\nL.D.S. — Liga Desportiva de Sofala`)
    res.status(201).json({ id: r.lastInsertRowid })
  })
})

// ---------- Área do treinador ----------
app.post('/api/login', (req, res) => {
  const ip = req.ip, n = fails.get(ip) || { c: 0, t: 0 }
  if (n.c >= 5 && Date.now() - n.t < 15 * 60e3) return res.status(429).json({ error: 'Demasiadas tentativas. Aguarde 15 minutos.' })
  const u = db.prepare('SELECT * FROM users WHERE email=?').get(String(req.body?.email || '').trim())
  if (!u || !check(String(req.body?.password || ''), u.pass)) { fails.set(ip, { c: n.c + 1, t: Date.now() }); return res.status(401).json({ error: 'Credenciais inválidas.' }) }
  fails.delete(ip)
  res.set('Set-Cookie', `lds=${token(u)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${E.NODE_ENV === 'production' ? '; Secure' : ''}`)
  res.json({ name: u.name, email: u.email })
})
app.post('/api/logout', (_, res) => { res.set('Set-Cookie', 'lds=; HttpOnly; Path=/; Max-Age=0'); res.json({ ok: true }) })
app.get('/api/me', auth, (req, res) => res.json(req.user))

const A = express.Router(); A.use(auth); app.use('/api/admin', A)
A.get('/athletes', (req, res) => {
  const { pos, status, from, to } = req.query, w = [], p = []
  if (pos) { w.push('(pos1=? OR pos2=?)'); p.push(pos, pos) }
  if (status) { w.push('status=?'); p.push(status) }
  if (from) { w.push('date(created_at)>=date(?)'); p.push(from) }
  if (to) { w.push('date(created_at)<=date(?)'); p.push(to) }
  res.json(db.prepare(`SELECT a.id,nome,pos1,pos2,status,created_at,
    (SELECT ROUND(AVG((velocidade+tecnica+visao+fisica)/4.0),1) FROM evaluations WHERE athlete_id=a.id) AS media FROM athletes a
    ${w.length ? 'WHERE ' + w.join(' AND ') : ''} ORDER BY created_at DESC`).all(...p))
})
A.get('/athletes/:id', (req, res) => {
  const a = db.prepare('SELECT * FROM athletes WHERE id=?').get(req.params.id)
  if (!a) return res.status(404).json({ error: 'Não encontrado.' })
  const evs = db.prepare('SELECT e.*,u.name AS treinador FROM evaluations e JOIN users u ON u.id=e.user_id WHERE athlete_id=?').all(a.id)
  res.json({ ...a, evals: evs, minha: evs.find(e => e.user_id === req.user.id) || null })
})
const star = (v) => Number.isInteger(+v) && +v >= 1 && +v <= 5
A.put('/athletes/:id/evaluation', (req, res) => {
  const { velocidade, tecnica, visao, fisica, nota = '' } = req.body || {}
  if (![velocidade, tecnica, visao, fisica].every(star)) return res.status(400).json({ error: 'Pontue os 4 critérios de 1 a 5.' })
  if (!db.prepare('SELECT 1 FROM athletes WHERE id=?').get(req.params.id)) return res.status(404).json({ error: 'Não encontrado.' })
  db.prepare(`INSERT INTO evaluations VALUES(?,?,?,?,?,?,?,datetime('now')) ON CONFLICT(athlete_id,user_id) DO UPDATE SET velocidade=excluded.velocidade,tecnica=excluded.tecnica,visao=excluded.visao,fisica=excluded.fisica,nota=excluded.nota,updated_at=excluded.updated_at`)
    .run(req.params.id, req.user.id, +velocidade, +tecnica, +visao, +fisica, String(nota).slice(0, 2000))
  res.json({ ok: true })
})
A.put('/athletes/:id/status', async (req, res) => {
  const a = db.prepare('SELECT * FROM athletes WHERE id=?').get(req.params.id), s = req.body?.status
  if (!a || !MSG[s]) return res.status(400).json({ error: 'Estado inválido.' })
  if (a.status !== s) { db.prepare('UPDATE athletes SET status=? WHERE id=?').run(s, a.id); const [sub, body] = MSG[s](a); await notify(a, sub, body) }
  res.json({ ok: true, notificado: a.status !== s })
})
A.get('/orders', (_, res) => res.json(db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all().map(o => ({ ...o, items: JSON.parse(o.items) }))))
A.put('/orders/:id/status', (req, res) => {
  const o = db.prepare('SELECT * FROM orders WHERE id=?').get(req.params.id), s = req.body?.status
  if (!o || !['Aguarda pagamento', 'Comprovativo recebido', 'Pago', 'Enviado', 'Entregue', 'Cancelada'].includes(s)) return res.status(400).json({ error: 'Estado inválido.' })
  db.transaction(() => {
    if (s === 'Cancelada' && o.status !== 'Cancelada') for (const it of JSON.parse(o.items)) {
      const p = db.prepare('SELECT stock FROM products WHERE id=?').get(it.id); if (!p) continue
      const st = JSON.parse(p.stock); st[it.size] = (st[it.size] || 0) + it.qty; db.prepare('UPDATE products SET stock=? WHERE id=?').run(JSON.stringify(st), it.id)
    }
    db.prepare('UPDATE orders SET status=? WHERE id=?').run(s, o.id)
  })()
  res.json({ ok: true })
})
A.put('/products/:id/stock', (req, res) => {
  const st = req.body?.stock
  if (!st || Object.values(st).some(v => !Number.isInteger(v) || v < 0)) return res.status(400).json({ error: 'Stock inválido.' })
  db.prepare('UPDATE products SET stock=? WHERE id=?').run(JSON.stringify(st), req.params.id); res.json({ ok: true })
})
A.get('/notifications', (_, res) => res.json(db.prepare('SELECT * FROM notifications ORDER BY id DESC LIMIT 50').all()))
A.get('/files/:name', (req, res) => {   // ficheiros privados: só treinadores autenticados (suporta Range p/ vídeo)
  const n = path.basename(req.params.name), f = path.join(UP, n)
  fs.existsSync(f) ? res.sendFile(f) : res.status(404).end()
})

// ---------- Frontend (build) ----------
const dist = path.join(root, 'dist')
if (fs.existsSync(dist)) { app.use(express.static(dist)); app.get(/^\/(?!api).*/, (_, res) => res.sendFile(path.join(dist, 'index.html'))) }
app.use((err, _, res, __) => { console.error(err); res.status(500).json({ error: 'Erro interno.' }) })
app.listen(+E.PORT || 3001, () => console.log(`L.D.S. a correr em http://localhost:${+E.PORT || 3001}`))

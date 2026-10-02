import type { Player, Row, Slide } from './types'

// ===== TREINADOR / DIRECTOR TÉCNICO =====
export const TREINADOR = { nome: 'Mussa Osman', cargo: 'Director Técnico' }

// ===== NOTÍCIAS (slideshow da página inicial) =====
// Imagens em public/img/. Para acrescentar uma notícia, junte um objeto à lista.
export const NOTICIAS: Slide[] = [
  { tag: 'Direção Técnica', t: 'Bem-vindo de volta a casa!', d: 'Mussa Osman assume o cargo de Diretor Técnico, trazendo a sua vasta experiência para impulsionar a LDS.', img: '/img/mussa-osman.png', alt: 'Mussa Osman, Diretor Técnico da LDS' },
  { tag: 'Seleção Nacional', t: 'Bravo, Seleção!', d: 'Zinho foi convocado para representar a Seleção Nacional de Futebol de Praia. Toda a família LDS deseja-lhe muito sucesso!', img: '/img/zinho-selecao.png', alt: 'Zinho com a camisola da LDS' },
  { tag: 'Expansão', t: 'Nosso embaixador em Tete', d: 'Representar a Liga Desportiva de Sofala é levar no peito o orgulho das nossas cores por onde for. Juntos somos mais fortes!', img: '/img/embaixador-tete.png', alt: 'Embaixador da LDS em Tete' },
  { tag: 'Loja Oficial', t: 'Já disponível para venda', d: 'Novos equipamentos oficiais a 1.500 MT. Primeiro lote com stock limitado — veste as cores do clube!', img: '/img/loja-verde.png', alt: 'Equipamento oficial da LDS', link: '#/loja', cta: 'Ir à Loja' },
]

// ===== LOJA (destaque na página inicial; os produtos reais vêm da API) =====
export const LOJA_DESTAQUE = {
  preco: '1.500 MT', nota: 'Primeiro lote · stock limitado',
  imgs: [
    { src: '/img/loja-verde.png', alt: 'Equipamento verde da LDS' },
    { src: '/img/loja-branca.png', alt: 'Equipamento branco da LDS' },
  ],
}

// ===== ÁREA DE SÓCIOS =====
export const SOCIOS = {
  img: '/img/socios.png',
  requisitos: ['Cópia do BI', '2 fotografias tipo passe', '200 MT correspondentes à quota mensal'],
  levantamento: 'Os cartões podem ser levantados no Caldeirão do Chiveve.',
  contactos: [{ label: '+258 84 322 8494', wa: '258843228494' }, { label: '+258 84 737 3921', wa: '258847373921' }],
}

// ===== EVENTOS E COMUNIDADE =====
export const EVENTOS = [
  {
    t: 'LDS na Feira — Cambridge Heights School',
    d: 'A Liga Desportiva de Sofala esteve presente na Feira Cambridge Heights School para comercializar os seus artigos oficiais. Visite o nosso espaço, conheça os produtos e adquira artigos da LDS.',
    img: '/img/feira.png', alt: 'Camisolas oficiais da LDS na Feira',
    inicio: '2026-09-19T10:00', fim: '2026-09-19T21:00',
    quando: 'Sábado, 19 Set 2026 · 10h00 às 21h00',
    onde: 'Casa dos Bicos, Beira · Mesa n.º 02',
    extra: 'Entradas: 30 MT',
  },
]

// ===== MATCH CENTER: GALERIA =====
export const GALERIA = [
  { src: '/img/galeria-estreia.png', alt: 'Jogador da LDS a emergir da terra, sob o céu azul', legenda: 'Sessão fotográfica criativa' },
  { src: '/img/galeria-relvado.png', alt: 'Dois atletas da LDS a conversar no relvado', legenda: 'Atletas em preparação no relvado' },
]

// ===== CLASSIFICAÇÃO (Moçambola, 14 clubes) =====
const T = (c: string, j: number, v: number, e: number, d: number, gm: number, gs: number, pts: number, me = false): Row =>
  ({ c, j, v, e, d, gm, gs, pts, me })
export const COMPETICOES: Record<string, Row[]> = {
  Moçambola: [
    T('Black Bulls', 19, 13, 5, 1, 28, 9, 44), T('Costa do Sol', 19, 11, 4, 4, 26, 12, 37),
    T('Ferroviário Beira', 19, 9, 7, 3, 23, 13, 34), T('Ferroviário Lichinga', 18, 9, 4, 5, 19, 13, 31),
    T('União Desportiva', 19, 6, 10, 3, 21, 15, 28), T('Ferroviário Nampula', 18, 8, 4, 6, 19, 24, 28),
    T('Ferroviário Maputo', 19, 7, 5, 7, 14, 11, 26), T('AD Vilankulo', 18, 5, 8, 5, 21, 16, 23),
    T('Ferroviário Nacala', 17, 5, 5, 7, 8, 12, 20), T('Baía de Pemba', 18, 4, 7, 7, 9, 14, 19),
    T('Desportiva de Sofala', 19, 4, 6, 9, 8, 19, 18, true), T('Desportiva de Pemba', 17, 5, 2, 10, 9, 19, 17),
    T('Chingale de Tete', 19, 2, 6, 11, 5, 17, 12), T('Maxaquene', 19, 1, 7, 11, 8, 24, 10),
  ],
}

export const CONQUISTAS = [
  { t: 'A preencher', s: 'Época', d: 'Adicione aqui o primeiro título do clube.' },
  { t: 'A preencher', s: 'Época', d: 'Taças, campeonatos provinciais, promoções.' },
]
export const HISTORIAL = [
  { a: '2017', t: 'Fundação do clube', d: 'Nasce a Liga Desportiva de Sofala.' },
  { a: '—', t: 'A preencher', d: 'Subida de divisão, primeiros títulos, marcos importantes.' },
]

// ===== PLANTEL (preencher idade, altura, peso, pe, nac, nat, jogos, golos, ass, cart) =====
export const POS = { GR: 'Guarda-redes', DEF: 'Defesa', MED: 'Médio', AVA: 'Avançado' }
export const PLANTEL: Player[] = [
  { n: 12, nm: 'Filipe', pos: 'GR', xi: true }, { n: 5, nm: 'Viola', pos: 'DEF', xi: true },
  { n: 21, nm: 'Zabula', pos: 'DEF', xi: true }, { n: 22, nm: 'Ashraf', pos: 'DEF', xi: true },
  { n: 19, nm: 'Lucas', pos: 'DEF', xi: true }, { n: 10, nm: 'Nelo', pos: 'MED', xi: true },
  { n: 15, nm: 'Casemiro', pos: 'MED', xi: true }, { n: 16, nm: 'Zinho', pos: 'MED', xi: true },
  { n: 11, nm: 'João', pos: 'AVA', xi: true }, { n: 25, nm: 'Paito', pos: 'AVA', xi: true },
  { n: 8, nm: 'Elcidio', pos: 'AVA', xi: true, cap: true },
  { n: 17, nm: 'Abú' }, { n: 3, nm: 'Avelino' }, { n: 23, nm: 'Mahalage' }, { n: 14, nm: 'Moyane' },
  { n: 7, nm: 'Leo' }, { n: 6, nm: 'Sandramo' }, { n: 24, nm: 'Carlos' }, { n: 20, nm: 'Helder' }, { n: 2, nm: 'Johane' },
]
// Onze inicial em 4-3-3 (posições no campo assumidas)
export const XI = [
  { n: 12, x: 50, y: 90 }, { n: 5, x: 18, y: 72 }, { n: 21, x: 39, y: 75 }, { n: 22, x: 61, y: 75 }, { n: 19, x: 82, y: 72 },
  { n: 10, x: 28, y: 52 }, { n: 15, x: 50, y: 56 }, { n: 16, x: 72, y: 52 },
  { n: 11, x: 22, y: 26 }, { n: 25, x: 50, y: 18 }, { n: 8, x: 78, y: 26 },
]

import type { Foto, Player, Row, Slide } from './types'

// ===== TREINADOR / DIRECTOR TÉCNICO =====
export const TREINADOR = { nome: 'Mussa Osman', cargo: 'Director Técnico' }

// ===== NOTÍCIAS (slideshow da página inicial) =====
// Imagens em public/img/. Para acrescentar uma notícia, junte um objeto à lista.
export const NOTICIAS: Slide[] = [
  { tag: 'Direção Técnica', t: 'Bem-vindo de volta a casa!', d: 'Mussa Osman assume o cargo de Diretor Técnico, trazendo a sua vasta experiência para impulsionar a LDS.', img: '/img/mussa-osman.png', alt: 'Mussa Osman, Diretor Técnico da LDS' },
  { tag: 'Seleção Nacional', t: 'Bravo, Seleção!', d: 'Zinho foi convocado para representar a Seleção Nacional de Futebol de Praia. Toda a família LDS deseja-lhe muito sucesso!', img: '/img/zinho-selecao.png', alt: 'Zinho com a camisola da LDS' },
  { tag: 'Expansão', t: 'Nosso embaixador em Tete', d: 'Representar a Liga Desportiva de Sofala é levar no peito o orgulho das nossas cores por onde for. Juntos somos mais fortes!', img: '/img/embaixador-tete.png', alt: 'Embaixador da LDS em Tete' },
  { tag: 'Match Center', t: 'Dia de jogo, camisola vestida', d: 'Onze em pose, relvado aberto e as cores da Liga no peito. Revive os melhores momentos na nossa galeria.', img: '/img/galeria/equipa-branco-fersol.jpg', alt: 'Onze inicial da LDS em pose, de camisola branca com mangas verdes', link: '#galeria', cta: 'Ver galeria' },
  { tag: 'Novo equipamento', t: 'Equipamento alternativo', d: 'Verde profundo, ondas brancas e o emblema da Liga junto ao coração. Conhece o desenho inspirado no nosso mar.', img: '/img/galeria/equipamento-alternativo.jpg', alt: 'Cartaz do equipamento alternativo da LDS, camisola verde com ondas brancas', link: '#galeria', cta: 'Ver na galeria' },
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

// ===== GALERIA =====
// Fotos em public/img/galeria/. Para acrescentar uma foto, junte um objeto à lista (cat define o separador).
export const GALERIA: Foto[] = [
  { src: '/img/galeria/equipa-branco-fersol.jpg', cat: 'Equipas', titulo: 'Onze em pose, uma só família',
    legenda: 'Branco e verde, relvado aberto e a mesma vontade de vencer. O onze da Liga antes de mais uma batalha.',
    alt: 'Onze jogadores da LDS em pose para a fotografia, de camisola branca com mangas verdes, com o guarda-redes de laranja' },
  { src: '/img/galeria/jogo-saida-de-bola.jpg', cat: 'Em jogo', titulo: 'Cabeça levantada, bola controlada',
    legenda: 'Uma finta no meio-campo e a Liga vira o jogo do avesso, com palmeiras de testemunha e a tarde a cair sobre o relvado.',
    alt: 'Jogador da LDS de camisola branca a rodar com a bola, perseguido por adversários de camisola às riscas verdes e brancas' },
  { src: '/img/galeria/equipamento-alternativo.jpg', cat: 'Equipamento', titulo: 'O mar também joga connosco',
    legenda: 'Equipamento alternativo: verde profundo, ondas brancas e o emblema da Liga bem junto ao coração.',
    alt: 'Cartaz do equipamento alternativo da LDS: camisola verde e branca com ondas desenhadas' },
  { src: '/img/galeria/treino-aquecimento.jpg', cat: 'Treino e bastidores', titulo: 'O jogo começa no aquecimento',
    legenda: 'Corrida em bloco, camisolas em ziguezague verde e branco e um relvado que já pede bola. Antes do apito, o grupo joga junto.',
    alt: 'Grupo de jogadores da LDS a correr em conjunto no aquecimento, de camisolas verdes e brancas e calções amarelos' },
  { src: '/img/galeria/equipa-amarelo-estadio.jpg', cat: 'Equipas', titulo: 'Outras cores, o mesmo emblema',
    legenda: 'Camisola às riscas amarelas, palmeiras ao fundo e a equipa pronta para a fotografia e para o apito inicial.',
    alt: 'Equipa da LDS em pose num estádio, de camisola listrada a amarelo e branco, com o guarda-redes de azul-claro' },
  { src: '/img/galeria/jogo-conducao-golo.jpg', cat: 'Em jogo', titulo: 'Calma a conduzir o jogo',
    legenda: 'Bola colada ao pé e olhos na linha de passe. O autocarro do clube espreita atrás da baliza e o banco acompanha cada metro.',
    alt: 'Jogador da LDS a conduzir a bola, com uma baliza e o autocarro do clube atrás' },
  { src: '/img/galeria/jogo-duelo-bancada.jpg', cat: 'Em jogo', titulo: 'Corrida lado a lado',
    legenda: 'Velocidade contra velocidade, com a bancada a assistir. Cada metro disputado conta.',
    alt: 'Jogador da LDS de camisola branca e verde em corrida com um adversário de amarelo e azul, em frente à bancada' },
  { src: '/img/galeria/raizes.png', cat: 'Treino e bastidores', titulo: 'Raízes bem fundas',
    legenda: 'Um jogador a emergir da terra sob o céu azul: a imagem de um clube que nasce do chão e cresce.',
    alt: 'Jogador da LDS a emergir da terra, sob o céu azul' },
  { src: '/img/galeria/conversa-relvado.png', cat: 'Treino e bastidores', titulo: 'Conversa no relvado',
    legenda: 'Dois atletas trocam ideias antes do treino: a preparação também se faz de palavras.',
    alt: 'Dois atletas da LDS a conversar no relvado' },
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

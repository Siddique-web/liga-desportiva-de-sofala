export interface Player {
  n: number; nm: string; pos?: 'GR' | 'DEF' | 'MED' | 'AVA'; xi?: boolean; cap?: boolean; foto?: string
  idade?: number; altura?: string; peso?: string; pe?: string; nac?: string; nat?: string
  jogos?: number; golos?: number; ass?: number; cart?: number
}
export interface Slide { tag: string; t: string; d: string; img?: string; alt?: string; link?: string; cta?: string }
export interface Row { c: string; j: number; v: number; e: number; d: number; gm: number; gs: number; pts: number; me?: boolean }
export interface Linha { id: number; size: string; qty: number }
export type CatFoto = 'Equipas' | 'Em jogo' | 'Treino e bastidores' | 'Equipamento'
export interface Foto { src: string; alt: string; titulo: string; legenda: string; cat: CatFoto }

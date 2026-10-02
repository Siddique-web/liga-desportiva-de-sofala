import { useLayoutEffect } from 'react'

/**
 * Animações de scroll (fade-in + zoom + fade-out superior) com IntersectionObserver.
 *
 * Estados de cada elemento `.scroll-fx` (o CSS está em styles.css):
 *   (sem classe) → ainda por baixo do viewport: invisível, deslocado e reduzido
 *   .in-view     → na zona de leitura: opacidade total, posição e escala normais
 *   .is-past     → saiu por cima: esmaecimento subtil + escala ligeiramente menor
 *
 * Funciona nos dois sentidos (ao subir, os elementos voltam a entrar) e também com
 * elementos que o React monta mais tarde (filtros, rotas, separadores), graças a um
 * MutationObserver que regista/remove elementos automaticamente.
 *
 * ⚠ Não aplicar `.scroll-fx` a um elemento cujo `className` muda em runtime via React
 *   (o React reescreve o atributo e apaga `.in-view`). Nesses casos, usar um wrapper estático.
 */
export interface ScrollFxOptions {
  /** Seletor dos elementos animados. */
  selector?: string
  /**
   * Margem do viewport. Por omissão é calculada:
   *  - topo: logo abaixo da navbar sticky (+56px), para o fade-out ser visível;
   *  - fundo: 10vh (máx. 56px), para disparar antes de o elemento aparecer por inteiro
   *    (o teto de 56px garante que o rodapé também anima no fim da página).
   */
  rootMargin?: string
  /** Atraso (ms) entre elementos que entram no mesmo "lote" (efeito escalonado). */
  stagger?: number
  /** Nº máximo de degraus do escalonamento (limita o atraso total a stagger × maxSteps). */
  maxSteps?: number
}

const IN = 'in-view'
const PAST = 'is-past'
const ON = 'fx-on'

export function useScrollAnimation({
  selector = '.scroll-fx',
  rootMargin,
  stagger = 80,
  maxSteps = 7,
}: ScrollFxOptions = {}) {
  // useLayoutEffect: `fx-on` entra antes do 1.º paint (sem flash de conteúdo visível → escondido).
  useLayoutEffect(() => {
    // Sem IntersectionObserver o `fx-on` nunca é ativado e o conteúdo fica simplesmente visível.
    if (typeof IntersectionObserver === 'undefined') return

    const html = document.documentElement
    const navH = parseFloat(getComputedStyle(html).getPropertyValue('--nav-h')) || 0
    const bottom = Math.round(Math.min(Math.max(innerHeight * 0.1, 24), 56))
    const margin = rootMargin ?? `-${navH + 56}px 0px -${bottom}px 0px`

    const io = new IntersectionObserver(
      entries => {
        // Elementos que acabam de entrar neste lote: cascata de cima para baixo, da esquerda para a direita.
        entries
          .filter(e => e.isIntersecting && !e.target.classList.contains(IN))
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
          .forEach((e, i) => {
            const el = e.target as HTMLElement
            const delay = el.dataset.fxDelay ?? String(Math.min(i, maxSteps) * stagger) // data-fx-delay="200" força um valor
            el.style.setProperty('--fx-delay', `${delay}ms`)
          })

        for (const e of entries) {
          const el = e.target
          if (e.isIntersecting) {
            el.classList.add(IN)
            el.classList.remove(PAST)
          } else if (e.boundingClientRect.bottom <= (e.rootBounds?.top ?? 0)) {
            el.classList.remove(IN) // saiu por cima → fade-out
            el.classList.add(PAST)
          } else {
            el.classList.remove(IN, PAST) // continua por baixo → estado inicial
          }
        }
      },
      { rootMargin: margin, threshold: 0 },
    )

    const watch = (n: Node) => {
      if (!(n instanceof Element)) return
      if (n.matches(selector)) io.observe(n)
      n.querySelectorAll(selector).forEach(el => io.observe(el))
    }
    const unwatch = (n: Node) => {
      if (!(n instanceof Element)) return
      if (n.matches(selector)) io.unobserve(n)
      n.querySelectorAll(selector).forEach(el => io.unobserve(el))
    }

    const mo = new MutationObserver(records =>
      records.forEach(r => {
        r.removedNodes.forEach(unwatch)
        r.addedNodes.forEach(watch)
      }),
    )

    html.classList.add(ON)
    watch(document.body)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      mo.disconnect()
      io.disconnect()
      html.classList.remove(ON)
    }
  }, [selector, rootMargin, stagger, maxSteps])
}

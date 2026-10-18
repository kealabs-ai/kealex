const SITE_HEADER_HEIGHT = 80
const SECTION_CLEARANCE = 40

export function scrollToSiteSection(id: string, clearance = SECTION_CLEARANCE) {
  const section = document.getElementById(id)
  if (!section) return

  const heading = section.matches('h1, h2, h3')
    ? section
    : section.querySelector<HTMLElement>('h1:not(.sr-only), h2, h3')
  const target = heading ?? section
  const top = target.getBoundingClientRect().top + window.scrollY - SITE_HEADER_HEIGHT - clearance
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion ? 'auto' : 'smooth' })
}

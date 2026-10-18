const SITE_HEADER_HEIGHT = 80
const SECTION_CLEARANCE = 16

export function scrollToSiteSection(id: string, clearance = SECTION_CLEARANCE) {
  const section = document.getElementById(id)
  if (!section) return

  const top = section.getBoundingClientRect().top + window.scrollY - SITE_HEADER_HEIGHT - clearance
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion ? 'auto' : 'smooth' })
}

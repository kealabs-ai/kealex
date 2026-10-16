import type { ReactNode } from 'react'
import mascotBanner from '../assets/mascote_kealex_topo.png'

interface PageBannerProps {
  section?: string
  title: string
  description: string
  action?: ReactNode
}

export function PageBanner({ section = 'Escritório', title, description, action }: PageBannerProps) {
  return (
    <section className="kea-process-hero" style={{ backgroundImage: `url("${mascotBanner}")` }} aria-labelledby="page-banner-title">
      <div className="kea-process-hero-copy">
        <p className="kea-process-breadcrumb">{section} <span aria-hidden="true">›</span> {title}</p>
        <h1 id="page-banner-title">{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </section>
  )
}

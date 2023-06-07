import type React from 'react'

export function SectionContainer({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-3xl md:px-0">{children}</div>
}

import type { ReactNode } from "react"

export default function TeamShell({ children }: { children: ReactNode }) {
  return <div className="team-shell min-h-screen bg-cream">{children}</div>
}

import type { ReactNode } from "react"
import { Link, NavLink } from "react-router-dom"

/*
App shell: header + main content. Used by every page so the nav stays
consistent. NavLink applies an "active" style when the current route
matches — we just rely on the default class for now.
*/

export const Layout = ({ children }: { children: ReactNode }) => (
  <>
    <header className="app-header">
      <div className="inner">
        <h1>
          <Link to="/" style={{ color: "inherit" }}>Event Mesh</Link>
        </h1>
        <nav>
          <NavLink to="/place">Place order</NavLink>
          <NavLink to="/customers">Look up customer</NavLink>
        </nav>
      </div>
    </header>
    <main className="container">{children}</main>
  </>
)

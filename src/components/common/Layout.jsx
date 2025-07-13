import { NavLink } from 'react-router-dom'
import './Layout.css'

function Layout({ children }) {
  return (
    <div className="layout">
      <header className="header">
        <div className="logo">
          <h1>Organic Code Studio</h1>
        </div>
        <nav className="nav">
          <NavLink to="/warroom" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            🎯 War Room UltraThink
          </NavLink>
        </nav>
      </header>
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout
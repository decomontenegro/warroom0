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
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            🏠 Home
          </NavLink>
          <NavLink to="/warroom3" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            🧠 War Room 3.0
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
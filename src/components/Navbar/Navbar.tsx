import './Navbar.css'
import logo from '../../assets/logo.png'

interface NavbarProps {
  onLogout: () => void;
}

function Navbar({ onLogout }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="Lotería" />
      </div>

      <ul className="navbar-links">
        <li><a href="#salas">Salas</a></li>
        <li><a href="#ranking">Ranking</a></li>
        <li><a href="#reglas">Reglas</a></li>
        <li>
          <button className="logout-btn" onClick={onLogout}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Salir
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
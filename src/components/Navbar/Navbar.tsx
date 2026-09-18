import './Navbar.css'
import logo from '../../assets/logo.png'

interface NavbarProps {
  onLogout: () => void;
  onAbrirSeccion?: (seccion: 'salas' | 'ranking' | 'reglas' | 'perfil') => void;
  onIrAlMenu?: () => void;
}

function Navbar({ onLogout, onAbrirSeccion, onIrAlMenu }: NavbarProps) {
  return (
    <nav className="navbar">
      <button
        type="button"
        className="navbar-logo"
        onClick={onIrAlMenu}
        aria-label="Ir al menú principal"
      >
        <img src={logo} alt="Lotería" />
      </button>

      <ul className="navbar-links">
        <li>
          <button
            type="button"
            className="nav-btn"
            onClick={() => onAbrirSeccion?.('perfil')}
          >
            Perfil
          </button>
        </li>
        <li>
          <button
            type="button"
            className="nav-btn"
            onClick={() => onAbrirSeccion?.('salas')}
          >
            Salas
          </button>
        </li>
        <li>
          <button
            type="button"
            className="nav-btn"
            onClick={() => onAbrirSeccion?.('ranking')}
          >
            Ranking
          </button>
        </li>
        <li>
          <button
            type="button"
            className="nav-btn"
            onClick={() => onAbrirSeccion?.('reglas')}
          >
            Reglas
          </button>
        </li>
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
import { useState, useEffect } from 'react'
import './Navbar.css'
import logo from '../../assets/logo.png'
import { MenuIcon, CloseIcon } from '../Icons/Icons'

interface NavbarProps {
  onLogout: () => void;
  onAbrirSeccion?: (seccion: 'salas' | 'ranking' | 'reglas' | 'perfil' | 'config') => void;
  onIrAlMenu?: () => void;
}

function Navbar({ onLogout, onAbrirSeccion, onIrAlMenu }: NavbarProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Cerrar menú si la pantalla crece
  useEffect(() => {
    const checkResize = () => {
      if (window.innerWidth > 768) {
        setMenuAbierto(false);
      }
    };
    window.addEventListener('resize', checkResize);
    return () => window.removeEventListener('resize', checkResize);
  }, []);

  const handleBotonClic = (accion: () => void) => {
    setMenuAbierto(false);
    accion();
  };

  return (
    <nav className="navbar">
      <button
        type="button"
        className="navbar-logo"
        onClick={() => handleBotonClic(onIrAlMenu || (() => {}))}
        aria-label="Ir al menú principal"
      >
        <img src={logo} alt="Lotería" />
      </button>

      <button 
        className="mobile-menu-btn"
        onClick={() => setMenuAbierto(true)}
        aria-label="Abrir menú"
      >
        <MenuIcon size={28} color="#465D6B" />
      </button>

      {menuAbierto && (
        <div className="mobile-overlay" onClick={() => setMenuAbierto(false)} />
      )}

      <ul className={`navbar-links ${menuAbierto ? 'open' : ''}`}>
        <li className="mobile-close-container">
          <button className="mobile-close-btn" onClick={() => setMenuAbierto(false)}>
            <CloseIcon size={24} color="#465D6B" />
          </button>
        </li>
        <li>
          <button
            type="button"
            className="nav-btn"
            onClick={() => handleBotonClic(() => onAbrirSeccion?.('perfil'))}
          >
            Perfil
          </button>
        </li>
        <li>
          <button
            type="button"
            className="nav-btn"
            onClick={() => handleBotonClic(() => onAbrirSeccion?.('salas'))}
          >
            Salas
          </button>
        </li>
        <li>
          <button
            type="button"
            className="nav-btn"
            onClick={() => handleBotonClic(() => onAbrirSeccion?.('ranking'))}
          >
            Ranking
          </button>
        </li>
        <li>
          <button
            type="button"
            className="nav-btn"
            onClick={() => handleBotonClic(() => onAbrirSeccion?.('reglas'))}
          >
            Reglas
          </button>
        </li>
        <li>
          <button
            type="button"
            className="nav-btn"
            onClick={() => handleBotonClic(() => onAbrirSeccion?.('config'))}
          >
            Configuración
          </button>
        </li>
        <li>
          <button className="logout-btn" onClick={() => handleBotonClic(onLogout)}>
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
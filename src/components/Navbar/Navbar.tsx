import './Navbar.css'
import logo from '../../assets/logo.png'
function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="Lotería" /> 
      </div>

      <ul className="navbar-links">
        <li><a href="#salas">Salas</a></li>
        <li><a href="#ranking">Ranking</a></li>
        <li><a href="#reglas">Reglas</a></li>
      </ul>
    </nav>
  )
}

export default Navbar
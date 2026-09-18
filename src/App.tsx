import { useState } from 'react'
import './App.css'
import logo from './assets/logo.png'
import LogIn from './components/Board/LogIn'
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home/Home'
import WaitingRoom from './pages/WaitingRoom/WaitingRoom'
import { conectarSocket, desconectarSocket, type DatosSala, type ModoJuego } from './socket/socket'

type Vista = 'login' | 'home' | 'espera'

function App() {
  const [autenticado, setAutenticado] = useState(false)
  const [vista, setVista] = useState<Vista>('home')
  const [sala, setSala] = useState<{ sala: DatosSala; modo: ModoJuego | null } | null>(null)

  const handleLogout = async () => {
    const accountNumber = localStorage.getItem('accountNumber')

    try {
      await fetch('http://localhost:3000/api/users/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber }),
      })
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error)
    }

    localStorage.removeItem('accountNumber')
    localStorage.removeItem('token')
    desconectarSocket()
    setSala(null)
    setVista('home')
    setAutenticado(false)
  }

  const handleLoginExitoso = () => {
    // El token ya quedó guardado por LogIn; el socket lo toma del localStorage
    conectarSocket()
    setVista('home')
    setAutenticado(true)
  }

  const ingresarSala = (datos: DatosSala, modo: ModoJuego | null) => {
    setSala({ sala: datos, modo })
    setVista('espera')
  }

  const salirDeSala = () => {
    setSala(null)
    setVista('home')
  }

  if (autenticado) {
    return (
      <div className="app-background">
        <Navbar onLogout={handleLogout} />
        {vista === 'espera' && sala ? (
          <WaitingRoom
            code={sala.sala.code}
            maxPlayers={sala.sala.maxPlayers}
            hostAccountNumber={sala.sala.hostAccountNumber}
            modo={sala.modo}
            onSalir={salirDeSala}
          />
        ) : (
          <Home onIngresarSala={ingresarSala} />
        )}
      </div>
    )
  }

  return (
    <div className="app-background">
      <img src={logo} alt="logo" className="logo" />

      <div className="content-wrapper">
        <LogIn onLoginExitoso={handleLoginExitoso} />
      </div>
    </div>
  )
}

export default App

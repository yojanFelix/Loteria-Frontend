import { useState } from 'react'
import './App.css'
import logo from './assets/logo.png'
import LogIn from './components/Board/LogIn'
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home'

function App() {
  const [autenticado, setAutenticado] = useState(false)

  if (autenticado) {
    return (
      <div className="app-background">
        <Navbar />
        <Home />
      </div>
    )
  }

  return (
    <div className="app-background">
      <img src={logo} alt="logo" className="logo" />

      <div className="content-wrapper">
        <LogIn onLoginExitoso={() => setAutenticado(true)} />
      </div>
    </div>
  )
}

export default App
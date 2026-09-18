import { useState } from 'react'
import './App.css'
import logo from './assets/logo.png'
import LogIn from './components/Board/LogIn'
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home/Home'
import Board from './components/Board/Board'
import { disconnectSocket } from './socket'

function App() {
  const [autenticado, setAutenticado] = useState(false)
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [board, setBoard] = useState<any>(null)

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

    disconnectSocket()
    localStorage.removeItem('accountNumber')
    localStorage.removeItem('token')
    setRoomCode(null)
    setBoard(null)
    setAutenticado(false)
  }

  const handleRoomReady = (code: string, boardData: unknown) => {
    setRoomCode(code)
    setBoard(boardData)
  }

  if (autenticado) {
    return (
      <div className="app-background">
        <Navbar onLogout={handleLogout} />
        {roomCode && board ? (
          <Board board={board} roomCode={roomCode} />
        ) : (
          <Home onRoomReady={handleRoomReady} />
        )}
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
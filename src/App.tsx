import { useState } from 'react'
import './App.css'
import logo from './assets/logo.png'
import LogIn from './components/Board/LogIn'
import RoomScreen from './components/Room/RoomScreen'
import Board from './components/Board/Board'

function App() {
  const [accountNumber, setAccountNumber] = useState<string | null>(
    localStorage.getItem('accountNumber')
  )
  const [roomCode, setRoomCode] = useState<string | null>(
    localStorage.getItem('roomCode')
  )

  return (
    <div className="app-background">
      <img src={logo} alt="logo" className="logo" />

      <div className="content-wrapper">
        {!accountNumber ? (
          <LogIn onLoginSuccess={setAccountNumber} />
        ) : !roomCode ? (
          <RoomScreen accountNumber={accountNumber} onRoomReady={setRoomCode} />
        ) : (
          <Board accountNumber={accountNumber} roomCode={roomCode} />
        )}
      </div>
    </div>
  )
}

export default App
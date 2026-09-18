import { useState } from 'react'
import styled from 'styled-components'

interface RoomScreenProps {
  accountNumber: string
  onRoomReady: (roomCode: string) => void
}

const RoomScreen = ({ accountNumber, onRoomReady }: RoomScreenProps) => {
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const crearSala = async () => {
    setError('')
    setCargando(true)

    try {
      const response = await fetch('http://localhost:3000/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostAccountNumber: accountNumber, maxPlayers: 4 }),
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        setError(data.message || 'No se pudo crear la sala')
        return
      }

      const roomCode = data.data.message.code
      localStorage.setItem('roomCode', roomCode)
      onRoomReady(roomCode)
    } catch (err) {
      setError('No se pudo conectar con el servidor')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  const unirseASala = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      const response = await fetch('http://localhost:3000/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: joinCode, accountNumber }),
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        setError(data.message || 'No se pudo unir a la sala')
        return
      }

      const roomCode = data.data.room.code
      localStorage.setItem('roomCode', roomCode)
      onRoomReady(roomCode)
    } catch (err) {
      setError('No se pudo conectar con el servidor')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  return (
    <StyledWrapper>
      <div className="room-container">
        <h2>¿Qué quieres hacer?</h2>

        <button onClick={crearSala} disabled={cargando} className="create-btn">
          {cargando ? 'Creando...' : 'Crear sala nueva'}
        </button>

        <div className="divider">o</div>

        <form onSubmit={unirseASala} className="join-form">
          <input
            required
            placeholder="Código de sala"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <button type="submit" disabled={cargando}>
            {cargando ? 'Uniendo...' : 'Unirse a sala'}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}
      </div>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  .room-container {
    max-width: 400px;
    background-color: #fff;
    padding: 32px 24px;
    font-family: inherit;
    color: #212121;
    display: flex;
    flex-direction: column;
    gap: 16px;
    border-radius: 10px;
    box-shadow:
      0px 0px 3px rgba(0, 0, 0, 0.084),
      0px 2px 3px rgba(0, 0, 0, 0.168);
  }

  h2 {
    text-align: center;
    margin: 0 0 8px 0;
  }

  .create-btn {
    padding: 12px 16px;
    background-color: #212121;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: inherit;
  }

  .create-btn:hover {
    background-color: #313131;
  }

  .divider {
    text-align: center;
    opacity: 0.5;
    font-size: 12px;
  }

  .join-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .join-form input {
    padding: 12px 16px;
    border-radius: 6px;
    border: 1px solid #141414;
    font-family: inherit;
  }

  .join-form button {
    padding: 12px 16px;
    background-color: #1778f2;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: inherit;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error-message {
    color: #e0245e;
    font-size: 13px;
    margin: 0;
    text-align: center;
  }
`

export default RoomScreen
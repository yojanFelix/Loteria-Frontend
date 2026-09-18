import { useState } from 'react';
import styled from 'styled-components';
import './Home.css';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/button-create';
import CreateRoomModal from '../../components/CreateRoomModal/CreateRoomModal';
import DesertLandscape from '../../components/DesertLandscape/DesertLandscape';
import { getSocket } from '../../socket';
import type { ModoJuego } from '../../socket/socket';

interface HomeProps {
  onRoomReady: (roomCode: string, board: unknown) => void;
}

function Home({ onRoomReady }: HomeProps) {
  const [showModal, setShowModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleCreateRoom = (nombre: string, maxPlayers: number, alias: string, modo: ModoJuego) => {
    setError('');
    setCargando(true);

    const socket = getSocket();

    socket.emit(
      'room:create',
      { name: nombre, maxPlayers, alias, winModes: [modo] },
      (response: { ok: boolean; data?: any; message?: string }) => {
        setCargando(false);

        if (!response.ok) {
          setError(response.message || 'No se pudo crear la sala');
          return;
        }

        setShowModal(false);
        onRoomReady(response.data.code, response.data.board);
      }
    );
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    const socket = getSocket();
    const alias = localStorage.getItem('userName') || 'Jugador';

    socket.emit(
      'room:join',
      { code: joinCode, alias },
      (response: { ok: boolean; data?: any; message?: string }) => {
        setCargando(false);

        if (!response.ok) {
          setError(response.message || 'No se pudo unir a la sala');
          return;
        }

        onRoomReady(response.data.room.code, response.data.board);
      }
    );
  };

  return (
    <Container>
      <div className="titulo">
        <h1 className="text">Loteria mexicana!</h1>
      </div>
      <div className="text-wrapper">
        <h3 className="text">Ingresa el codigo de la sala</h3>
      </div>

      <form onSubmit={handleJoinRoom}>
        <div className="content-wrapper">
          <Input value={joinCode} onChange={setJoinCode} />
        </div>
        <div className="button-wrapper">
          <button type="submit" disabled={cargando || !joinCode}>
            {cargando ? 'Uniendo...' : 'Unirse'}
          </button>
        </div>
      </form>

      <div className="button-wrapper">
        <Button onClick={() => setShowModal(true)} />
      </div>

      {error && (
        <div className="text-wrapper">
          <p style={{ color: '#e0245e' }}>{error}</p>
        </div>
      )}

      {showModal && (
        <CreateRoomModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreateRoom}
        />
      )}

      {/* Paisaje desértico en la parte inferior */}
      <DesertLandscape />
    </Container>
  );
}

// --- ESTILOS RESPONSIVOS Y TEMÁTICOS (Styled Components) ---

const Container = styled.div`
  width: 100%;
  min-height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: 0 16px 0;
  overflow-x: hidden;
  box-sizing: border-box;
`;

export default Home;

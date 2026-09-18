import { useState } from 'react';
import './Home.css';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/button-create';
import CreateRoomModal from '../../components/CreateRoomModal/CreateRoomModal';
import { getSocket } from '../../socket';

interface HomeProps {
  onRoomReady: (roomCode: string, board: unknown) => void;
}

function Home({ onRoomReady }: HomeProps) {
  const [showModal, setShowModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleCreateRoom = async (maxPlayers: number) => {
    setError('');
    setCargando(true);

    const socket = getSocket();

    socket.emit(
      'room:create',
      { name: 'Sala de Loteria', maxPlayers },
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

    socket.emit(
      'room:join',
      { code: joinCode },
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
    <>
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
          onCreate={(selectedPlayers) => handleCreateRoom(selectedPlayers)}
        />
      )}
    </>
  );
}

export default Home;
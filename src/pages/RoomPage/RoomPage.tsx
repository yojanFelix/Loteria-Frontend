import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WaitingRoom from '../WaitingRoom/WaitingRoom';
import { unirseSala, type DatosSala, type ModoJuego } from '../../socket/socket';

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [sala, setSala] = useState<{ datos: DatosSala; modos: ModoJuego[] } | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const conectar = async () => {
      if (!roomId) return;
      
      const token = localStorage.getItem('token');
      const accountNumber = localStorage.getItem('accountNumber');
      if (!token || !accountNumber) {
        // Redirigir a login, guardando la sala para después
        navigate(`/?join=${roomId}`);
        return;
      }

      let alias = localStorage.getItem('userName') || accountNumber;

      try {
        const cleanRoomId = roomId.toUpperCase();
        const salaActualizada = await unirseSala(cleanRoomId, alias);
        setSala({ 
          datos: salaActualizada, 
          modos: salaActualizada.winModes ?? [] 
        });
      } catch (err) {
        console.error('Error al unirse a la sala:', err);
        setError(err instanceof Error ? err.message : 'No se pudo entrar a la sala. Es posible que no exista o esté llena.');
      } finally {
        setCargando(false);
      }
    };

    void conectar();
  }, [roomId, navigate]);

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
        <h2>Conectando a la sala...</h2>
      </div>
    );
  }

  if (error || !sala) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
        <h2>{error || 'Error desconocido'}</h2>
        <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <WaitingRoom
      code={sala.datos.code}
      maxPlayers={sala.datos.maxPlayers}
      hostAccountNumber={sala.datos.hostAccountNumber}
      modos={sala.modos}
      onSalir={() => navigate('/')}
    />
  );
}

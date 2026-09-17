import { useEffect, useState } from 'react';
import './Home.css';
import Input from '../components/Input/Input';
import Button from '../components/Button/button-create';
import RoomList from '../components/RoomList/RoomList';
import type { Room } from '../components/RoomList/RoomList';
import CreateRoomModal from '../components/CreateRoomModal/CreateRoomModal';

function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

 const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/rooms');
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();

      // Verificamos que result.data exista y sea un arreglo antes de usar .map()
      if (result.ok && Array.isArray(result.data)) {
        const formattedRooms: Room[] = result.data.map((room: any) => ({
          code: room.code,
          name: `Sala ${room.code.substring(0, 3)}`,
          // Usamos ?. por si el backend no incluyó el contador de jugadores
          playersCount: room._count?.players || 0 
        }));
        setRooms(formattedRooms);
      } else {
        console.warn("El formato de respuesta del backend no es el esperado:", result);
      }
    } catch (error) {
      console.error("Error detallado al cargar salas:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (maxPlayers: number) => {
    try {
      // Toma el número de cuenta guardado en el login
      const accountNumber = localStorage.getItem('accountNumber'); 

      if (!accountNumber) {
        alert("No se encontró la sesión. Por favor, inicia sesión nuevamente.");
        return;
      }

      const response = await fetch('http://localhost:3000/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hostAccountNumber: accountNumber, 
          maxPlayers: maxPlayers
        })
      });

      const result = await response.json();

      if (result.ok) {
        setShowModal(false);
        const codigoGenerado = result.data.message.code;
        alert(`¡Sala creada exitosamente! Tu código es: ${codigoGenerado}`);
        fetchRooms();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="titulo">
        <h1 className="text">Loteria mexicana!</h1>
      </div>
      <div className="text-wrapper">
        <h3 className="text">Ingresa el codigo de la sala</h3>
      </div>
      <div className="content-wrapper">
        <Input />
      </div>
      <div className="button-wrapper">
        <Button onClick={() => setShowModal(true)} />
      </div>

      <div className="rooms-wrapper">
        {loading ? (
          <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>Cargando salas...</p>
        ) : (
          <RoomList rooms={rooms} />
        )}
      </div>

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
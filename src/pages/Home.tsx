import { useState } from 'react';
import './Home.css';
import Input from '../components/Input/Input';
import Button from '../components/Button/button-create';
import CreateRoomModal from '../components/CreateRoomModal/CreateRoomModal';

function Home() {
  const [showModal, setShowModal] = useState(false);

  const handleCreateRoom = async (maxPlayers: number) => {
    try {
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
import { useState } from 'react';
import './Home.css';
import styled from 'styled-components';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/button-create';
import CreateRoomModal from '../../components/CreateRoomModal/CreateRoomModal';
import { crearSala, unirseSala, type DatosSala, type ModoJuego } from '../../socket/socket';

interface HomeProps {
  onIngresarSala: (sala: DatosSala, modo: ModoJuego | null) => void;
}

const TEXTO_VALIDO = /^[\p{L}\p{N} _-]+$/u;

function Home({ onIngresarSala }: HomeProps) {
  const [showModal, setShowModal] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [alias, setAlias] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleUnirse = async () => {
    setError('');

    if (!/^[A-Z0-9]{3}-[A-Z0-9]{3}$/.test(codigo)) {
      setError('El código debe tener el formato XXX-XXX');
      return;
    }

    const aliasLimpio = alias.trim();
    if (aliasLimpio.length < 3 || aliasLimpio.length > 12) {
      setError('El alias debe tener entre 3 y 12 caracteres');
      return;
    }
    if (!TEXTO_VALIDO.test(aliasLimpio)) {
      setError('El alias solo puede tener letras, números, espacios, guiones y guiones bajos');
      return;
    }

    setCargando(true);
    try {
      const sala = await unirseSala(codigo, aliasLimpio);
      // El backend aún no devuelve el modo en el join (gap a reportar)
      onIngresarSala(sala, null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo unir a la sala');
    } finally {
      setCargando(false);
    }
  };

  const handleCreateRoom = async (
    nombre: string,
    maxPlayers: number,
    aliasSala: string,
    modo: ModoJuego,
  ) => {
    setError('');
    setCargando(true);
    try {
      const sala = await crearSala(nombre, maxPlayers, aliasSala, modo);
      setShowModal(false);
      onIngresarSala(sala, modo);
    } catch (err) {
      setShowModal(false);
      setError(err instanceof Error ? err.message : 'No se pudo crear la sala');
    } finally {
      setCargando(false);
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
        <Input value={codigo} onChange={setCodigo} onSubmit={handleUnirse} />
      </div>

      <div className="content-wrapper">
        <StyledAlias
          type="text"
          placeholder="Tu alias (3-12 caracteres)"
          value={alias}
          maxLength={12}
          onChange={(e) => setAlias(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleUnirse();
          }}
        />
      </div>

      {error && (
        <div className="text-wrapper">
          <p className="error-message">{error}</p>
        </div>
      )}

      <div className="button-wrapper">
        <StyledUnirse onClick={handleUnirse} disabled={cargando}>
          {cargando ? 'Entrando...' : 'Unirse'}
        </StyledUnirse>
        <Button onClick={() => setShowModal(true)} />
      </div>

      {showModal && (
        <CreateRoomModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreateRoom}
        />
      )}
    </>
  );
}

const StyledAlias = styled.input`
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid #141414;
  font-family: inherit;
  font-size: 14px;
  width: 220px;

  &::placeholder {
    opacity: 0.5;
  }

  &:focus {
    outline: none;
    border-color: #1778f2;
  }
`;

const StyledUnirse = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: inherit;
  color: #fff;
  background-color: #212121;
  border: none;
  padding: 12px 32px;
  font-size: 14px;
  gap: 8px;
  cursor: pointer;
  border-radius: 6px;
  box-shadow:
    0px 0px 3px rgba(0, 0, 0, 0.084),
    0px 2px 3px rgba(0, 0, 0, 0.168);

  &:hover {
    background-color: #313131;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default Home;

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

const BotonVolver = styled.button`
  align-self: flex-start;
  background: transparent;
  border: none;
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 600;
  color: var(--color-dark);
  cursor: pointer;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(70, 93, 107, 0.08);
  }
`;

// --- VISTA 1: MENU ---
const MenuContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 480px;
  margin-top: 10px;
  animation: fadeIn 0.3s ease;
  position: relative;
  z-index: 2;
`;

const TituloPrincipal = styled.h1`
  font-family: var(--font-theme);
  color: var(--color-dark);
  font-size: clamp(32px, 7vw, 48px);
  text-align: center;
  margin: 10px 0 16px;
  letter-spacing: 0.5px;
`;

const IlustracionWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 0 32px;

  .vignette-emblema {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-width: 240px;
    height: clamp(85px, 20vw, 120px);
    cursor: pointer;
  }

  .vignette-sombrero {
    position: absolute;
    width: clamp(95px, 22vw, 145px);
    height: auto;
    object-fit: contain;
    transform: translate(-20px, -12px) rotate(-14deg);
    opacity: 0.95;
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.14));
    transition: transform 0.3s ease;
  }

  .maracas-img {
    position: relative;
    z-index: 2;
    width: clamp(85px, 20vw, 125px);
    height: auto;
    object-fit: contain;
    transform: translate(16px, 6px) rotate(6deg);
    filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.15));
    transition: transform 0.3s ease;
  }

  .vignette-emblema:hover .maracas-img {
    transform: translate(16px, 2px) rotate(14deg) scale(1.06);
  }

  .vignette-emblema:hover .vignette-sombrero {
    transform: translate(-22px, -16px) rotate(-18deg) scale(1.05);
  }
`;

const MenuBotones = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  align-items: center;
`;

const BotonBase = styled.button`
  width: 100%;
  max-width: 380px;
  min-height: 58px;
  border: none;
  border-radius: 16px;
  font-family: var(--font-theme);
  font-size: clamp(19px, 4.5vw, 24px);
  color: #ffffff;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12);

  &:hover {
    transform: translateY(-3px) scale(1.015);
    filter: brightness(1.06);
  }

  &:active {
    transform: translateY(0) scale(0.99);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const BotonRojo = styled(BotonBase)`
  background-color: var(--color-red);
  box-shadow: 0 5px 15px rgba(216, 87, 93, 0.35);

  &:hover {
    box-shadow: 0 7px 20px rgba(216, 87, 93, 0.45);
  }
`;

const BotonAzul = styled(BotonBase)`
  background-color: var(--color-blue);
  box-shadow: 0 5px 15px rgba(129, 174, 183, 0.35);

  &:hover {
    box-shadow: 0 7px 20px rgba(129, 174, 183, 0.45);
  }
`;

// --- VISTA 2: UNIRSE ---
const FormContent = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 440px;
  margin-top: 10px;
  animation: fadeIn 0.3s ease;
  position: relative;
  z-index: 2;
`;

const TituloSeccion = styled.h2`
  font-family: var(--font-theme);
  color: var(--color-dark);
  font-size: clamp(24px, 5.5vw, 36px);
  text-align: center;
  line-height: 1.3;
  margin: 10px 0 24px;
`;

const CamposWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  margin-bottom: 24px;
`;

const InputCodigo = styled.input`
  width: 100%;
  height: 60px;
  background-color: #fffef8;
  border: 1.5px solid var(--color-blue);
  border-radius: 12px;
  font-family: var(--font-sans);
  font-size: 24px;
  font-weight: 700;
  color: var(--color-dark);
  text-align: center;
  letter-spacing: 4px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &::placeholder {
    color: rgba(70, 93, 107, 0.4);
    letter-spacing: 3px;
  }

  &:focus {
    outline: none;
    border-color: var(--color-red);
    box-shadow: 0 0 0 3px rgba(216, 87, 93, 0.2);
  }
`;

const InputAlias = styled.input`
  width: 100%;
  height: 52px;
  background-color: #fffef8;
  border: 1.5px solid rgba(70, 93, 107, 0.25);
  border-radius: 12px;
  font-family: var(--font-sans);
  font-size: 16px;
  color: var(--color-dark);
  text-align: center;
  transition: all 0.2s ease;

  &::placeholder {
    color: rgba(70, 93, 107, 0.5);
  }

  &:focus {
    outline: none;
    border-color: var(--color-dark);
    box-shadow: 0 0 0 3px rgba(70, 93, 107, 0.15);
  }
`;

const MensajeError = styled.p`
  color: var(--color-red);
  font-weight: 600;
  font-size: 14px;
  text-align: center;
  margin-bottom: 16px;
  background-color: rgba(216, 87, 93, 0.08);
  padding: 8px 16px;
  border-radius: 8px;
`;

// --- VISTA 3: CREAR SALA ---
const CrearContent = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 620px;
  margin-top: 5px;
  animation: fadeIn 0.3s ease;
  position: relative;
  z-index: 2;
`;


const CamposCrearRow = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  margin-bottom: 24px;

  @media (max-width: 540px) {
    flex-direction: column;
  }
`;

const InputPequeno = styled.input`
  flex: 1;
  height: 46px;
  background-color: #ffffff;
  border: 1.5px solid rgba(70, 93, 107, 0.25);
  border-radius: 10px;
  font-family: var(--font-sans);
  font-size: 15px;
  padding: 0 14px;
  color: var(--color-dark);

  &::placeholder {
    color: rgba(70, 93, 107, 0.5);
  }

  &:focus {
    outline: none;
    border-color: var(--color-dark);
  }
`;

const SubtituloLlamadas = styled.h3`
  font-family: var(--font-theme);
  color: var(--color-dark);
  font-size: clamp(20px, 4.5vw, 28px);
  text-align: center;
  margin: 8px 0 4px;
`;

const TextoAyudaPatrones = styled.p`
  font-family: var(--font-sans);
  color: rgba(70, 93, 107, 0.78);
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  margin: 0 0 20px;
`;

const GrillaPatrones = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  width: 100%;
  margin-bottom: 28px;

  @media (max-width: 520px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
`;

const MiniCuadricula = styled.div`
  width: 84px;
  height: 96px;
  background-color: #81AEB7;
  border-radius: 6px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  padding: 3px;
  position: relative;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
`;

const TarjetaPatron = styled.button`
  background: transparent;
  border: none;
  padding: 6px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:hover ${MiniCuadricula} {
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.18);
  }
`;

const Celda = styled.div`
  border: 0.75px solid rgba(255, 255, 255, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FichaCirculo = styled.div`
  width: 12px;
  height: 12px;
  background-color: #F9EEDB;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`;

const checkPop = keyframes`
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  75% {
    transform: scale(1.08);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const CheckPincelada = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  z-index: 3;
  animation: ${checkPop} 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  img {
    width: 90%;
    height: 90%;
    object-fit: contain;
    filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3));
  }
`;

const NombrePatron = styled.span`
  font-family: var(--font-theme);
  font-size: 15px;
  color: var(--color-dark);
  margin-top: 8px;
  text-align: center;
  letter-spacing: 0.3px;
`;

const BotonCrearFinal = styled(BotonBase)`
  background-color: var(--color-dark);
  max-width: 220px;
  min-height: 52px;
  margin-bottom: 20px;
  box-shadow: 0 5px 15px rgba(70, 93, 107, 0.35);

  &:hover {
    box-shadow: 0 7px 20px rgba(70, 93, 107, 0.5);
  }
`;

const PartidaActivaCard = styled.div`
  background: #ffffff;
  border: 2px solid rgba(216, 87, 93, 0.35);
  border-radius: 16px;
  padding: 16px 20px;
  max-width: 380px;
  width: 100%;
  margin-bottom: 20px;
  box-shadow: 0 6px 18px rgba(216, 87, 93, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
`;

const PartidaActivaHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PartidaActivaTitulo = styled.h4`
  margin: 0;
  font-family: var(--font-theme, 'Pattaya', cursive);
  font-size: 20px;
  color: var(--color-dark, #465D6B);
`;

const PartidaActivaTexto = styled.p`
  margin: 0;
  font-family: var(--font-sans, system-ui);
  font-size: 13.5px;
  color: rgba(70, 93, 107, 0.85);

  strong {
    color: var(--color-dark, #465D6B);
  }

  code {
    background: rgba(216, 87, 93, 0.1);
    color: var(--color-red, #D8575D);
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 700;
  }
`;

const PartidaActivaAcciones = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
  width: 100%;
`;

const BotonVolverPartida = styled.button`
  flex: 1;
  padding: 10px 14px;
  background-color: var(--color-red, #D8575D);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-family: var(--font-sans, system-ui);
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #b94247;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(216, 87, 93, 0.35);
  }
`;

const BotonAbandonarPartida = styled.button`
  padding: 10px 14px;
  background: transparent;
  color: rgba(70, 93, 107, 0.7);
  border: 1px solid rgba(70, 93, 107, 0.25);
  border-radius: 10px;
  font-family: var(--font-sans, system-ui);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: var(--color-red, #D8575D);
    border-color: rgba(216, 87, 93, 0.4);
    background: rgba(216, 87, 93, 0.05);
  }
`;

export default Home;

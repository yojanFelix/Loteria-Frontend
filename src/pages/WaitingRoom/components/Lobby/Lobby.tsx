import { useState } from 'react';
import { useGameStore } from '../../../../store/gameStore';
import { ETIQUETAS_MODOS } from '../../../../utils/constants';
import { iniciarPartida, abandonarSala } from '../../../../socket/socket';
import { CopyIcon, QrIcon, CheckIcon } from '../../../../components/Icons/Icons';
import QRModal from '../../../../components/QRModal/QRModal';
import type { ModoJuego } from '../../../../types/game.types';

interface LobbyProps {
  code: string;
  hostAccountNumber: string;
  modos: ModoJuego[];
  onSalir: () => void;
}

export default function Lobby({ code, hostAccountNumber, modos, onSalir }: LobbyProps) {
  const jugadores = useGameStore((state) => state.jugadoresEnSala);
  const [copiado, setCopiado] = useState(false);
  const [mostrarQR, setMostrarQR] = useState(false);
  const [iniciando, setIniciando] = useState(false);
  const [error, setError] = useState('');

  const cuentaLocal = localStorage.getItem('accountNumber') ?? '';
  const esHost = hostAccountNumber === cuentaLocal;

  const copiarCodigo = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setError('No se pudo copiar el código');
    }
  };

  const iniciar = async () => {
    setError('');
    setIniciando(true);
    try {
      await iniciarPartida(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar la partida');
    } finally {
      setIniciando(false);
    }
  };

  const salir = async () => {
    try {
      await abandonarSala(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo salir de la sala');
      return;
    }
    try {
      localStorage.removeItem('activeRoom');
      localStorage.removeItem(`marcadas_${code}`);
    } catch {}
    onSalir();
  };

  return (
    <div className="waiting-container">
      <h2>Sala de espera</h2>

      {modos.length > 0 && (
        <p className="modo-juego">
          Modo de juego: {modos.map((m) => ETIQUETAS_MODOS[m]).join(', ')}
        </p>
      )}

      <div className="codigo-fila">
        <span className="codigo">{code}</span>
        <button type="button" className="boton-copiar" onClick={copiarCodigo}>
          {copiado ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
          <span>{copiado ? '¡Copiado!' : 'Copiar'}</span>
        </button>
        <button type="button" className="boton-qr" onClick={() => setMostrarQR(true)}>
          <QrIcon size={15} />
          <span>Ver QR</span>
        </button>
      </div>

      <QRModal
        code={code}
        isOpen={mostrarQR}
        onClose={() => setMostrarQR(false)}
      />

      <h3>
        Jugadores conectados ({jugadores.length})
      </h3>

      {jugadores.length === 0 && <p className="cargando">Cargando jugadores…</p>}

      <ul className="lista-jugadores">
        {jugadores.map((jugador) => (
          <li key={jugador.accountNumber}>
            {jugador.alias}
            {jugador.accountNumber === cuentaLocal && ' (tú)'}
          </li>
        ))}
      </ul>

      {error && <p className="error-message">{error}</p>}

      {esHost && (
        <button type="button" className="boton-iniciar" onClick={iniciar} disabled={iniciando}>
          {iniciando ? 'Iniciando…' : 'Iniciar partida'}
        </button>
      )}

      <button type="button" className="boton-salir" onClick={salir}>
        Salir
      </button>
    </div>
  );
}

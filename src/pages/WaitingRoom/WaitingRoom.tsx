import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import {
  abandonarSala,
  cantarLoteria,
  ETIQUETAS_MODOS,
  etiquetaDePatron,
  getCartasCantadas,
  getGanador,
  getJugadoresDeSala,
  getNotificaciones,
  getPartidaIniciada,
  getTablero,
  getUltimaLlamada,
  iniciarPartida,
  notificarJugada,
  sincronizarEstadoPartida,
  suscribirCartas,
  suscribirJugadores,
  suscribirNotificaciones,
  suscribirPartida,
  type Carta,
  type GanadorInfo,
  type JugadorEnSala,
  type ModoJuego,
  type NotificacionJugada,
  type TableroJugador,
} from '../../socket/socket';
import { patronesCompletados } from '../../utils/patrones';
import { imagenDeCarta } from '../../utils/cartas';
import frijolImg from '../../assets/theme/frijol.png';
import QRModal from '../../components/QRModal/QRModal';
import { TrophyIcon, QrIcon, CopyIcon, CheckIcon } from '../../components/Icons/Icons';

// El backend canta una carta nueva cada 4 segundos (CALL_INTERVAL_MS del servidor)
const DURACION_CARTA_MS = 4000;

interface WaitingRoomProps {
  code: string;
  maxPlayers?: number;
  hostAccountNumber: string;
  modos: ModoJuego[];
  onSalir: () => void;
}

const WaitingRoom = ({ code, hostAccountNumber, modos, onSalir }: WaitingRoomProps) => {
  const [jugadores, setJugadores] = useState<JugadorEnSala[]>(() => getJugadoresDeSala(code));
  const [error, setError] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [mostrarQR, setMostrarQR] = useState(false);
  const [iniciando, setIniciando] = useState(false);
  const [cantando, setCantando] = useState(false);
  const [partidaIniciada, setPartidaIniciada] = useState(getPartidaIniciada);
  const [tablero, setTablero] = useState<TableroJugador | null>(getTablero);
  const [cartasCantadas, setCartasCantadas] = useState<Carta[]>(getCartasCantadas);
  const [ganador, setGanador] = useState<GanadorInfo | null>(getGanador);
  // El reloj del efecto lo actualiza cada 100 ms; arranca en 0 (sin impurezas en render)
  const [ahora, setAhora] = useState(0);
  // El usuario marca sus cartas manualmente cuando las canta el cantor (con caché local)
  const [marcadas, setMarcadas] = useState<number[]>(() => {
    try {
      const guardadas = localStorage.getItem(`marcadas_${code}`);
      return guardadas ? JSON.parse(guardadas) : [];
    } catch {
      return [];
    }
  });
  const [notificaciones, setNotificaciones] = useState<NotificacionJugada[]>(getNotificaciones);
  // Patrones que este cliente ya anunció; evita spam al marcar/desmarcar varias veces.
  const patronesAnunciados = useRef(new Set<string>());

  const { width, height } = useWindowSize();

  const alternarCarta = (id: number) => {
    // Solo se puede marcar una carta que el cantor ya nombró.
    const yaCantada = cartasCantadas.some((carta) => carta.id === id);
    if (!yaCantada) {
      setError('No puedes marcar esa carta: aún no ha sido cantada');
      return;
    }
    setError('');

    const isMarked = marcadas.includes(id);
    const nuevo = isMarked ? marcadas.filter((m) => m !== id) : [...marcadas, id];

    // Al marcar, avisamos al servidor de TODOS los patrones que quedaron
    // completos con esta jugada (línea, esquinas, etc.), sin importar el modo.
    if (!isMarked && tablero) {
      const completados = patronesCompletados(tablero.cards, nuevo);
      for (const pattern of completados) {
        const clave = `${code}_${pattern}`;
        if (!patronesAnunciados.current.has(clave)) {
          patronesAnunciados.current.add(clave);
          void notificarJugada(code, pattern);
        }
      }
    }

    // Reproducir sonido al marcar (usando un Audio base64 muy corto)
    if (!isMarked) {
      try {
        // Sonido corto de 'pop' / 'click' para el frijolito
        const popSound = new Audio('data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
        popSound.volume = 0.5;
        popSound.play().catch(() => {}); // Ignorar error si el navegador bloquea autoplay
      } catch (e) {}
    }

    try {
      localStorage.setItem(`marcadas_${code}`, JSON.stringify(nuevo));
    } catch {
      // Ignorar fallo de almacenamiento
    }
    setMarcadas(nuevo);
  };

  // El backend emite room:players a la sala en cada cambio; aquí solo nos
  // suscribimos. La lista inicial ya está sembrada en el store del socket.
  useEffect(() => {
    const cancelar = suscribirJugadores(() => setJugadores(getJugadoresDeSala(code)));
    return cancelar;
  }, [code]);

  // game:started (broadcast a la sala) y game:board (canal personal) actualizan
  // el store del socket; aquí solo reaccionamos a los cambios.
  useEffect(() => {
    const cancelar = suscribirPartida(() => {
      setPartidaIniciada(getPartidaIniciada());
      setTablero(getTablero());
      setGanador(getGanador());
    });
    return cancelar;
  }, []);

  // card:called actualiza el historial; nos suscribimos para re-renderizar.
  useEffect(() => {
    const cancelar = suscribirCartas(() => {
      const nuevas = getCartasCantadas();
      setCartasCantadas(nuevas);
      
      // Reproducir audio con la API de síntesis de voz
      if (nuevas.length > 0) {
        const ultimaCarta = nuevas[nuevas.length - 1];
        if (ultimaCarta) {
          window.speechSynthesis.cancel(); // Detener cualquier audio previo
          const speech = new SpeechSynthesisUtterance(ultimaCarta.name);
          speech.lang = 'es-MX';
          speech.rate = 1.1;
          window.speechSynthesis.speak(speech);
        }
      }
    });
    return cancelar;
  }, []);

  // Feed de notificaciones de jugadas: llegan por broadcast room:notification.
  useEffect(() => {
    const cancelar = suscribirNotificaciones(setNotificaciones);
    return cancelar;
  }, []);

  // Al entrar a la partida, sincroniza el historial con el servidor (game:state).
  useEffect(() => {
    if (partidaIniciada) {
      void sincronizarEstadoPartida(code);
    }
  }, [partidaIniciada, code]);

  // Reloj de la UI: cada 100 ms para el contador de la carta actual.
  useEffect(() => {
    const intervalo = setInterval(() => setAhora(Date.now()), 100);
    return () => clearInterval(intervalo);
  }, []);

  const cuentaLocal = localStorage.getItem('accountNumber') ?? '';
  const esHost = hostAccountNumber === cuentaLocal;

  const iniciar = async () => {
    setError('');
    setIniciando(true);
    try {
      // El backend reparte los tableros (game:board) y avisa a la sala (game:started)
      await iniciarPartida(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar la partida');
    } finally {
      setIniciando(false);
    }
  };

  // El jugador grita "¡Lotería!": el servidor revalida su tablero contra las
  // cartas cantadas; si es válido, llega el broadcast game:finished con el ganador.
  const cantar = async () => {
    setError('');
    setCantando(true);
    try {
      await cantarLoteria(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reclamo rechazado');
    } finally {
      setCantando(false);
    }
  };

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

  const salir = async () => {
    try {
      await abandonarSala(code);
    } catch (err) {
      // Aunque el backend falle, volvemos a Home; el janitor limpia salas vacías
      setError(err instanceof Error ? err.message : 'No se pudo salir de la sala');
      return;
    }
    try {
      localStorage.removeItem('activeRoom');
      localStorage.removeItem(`marcadas_${code}`);
    } catch {
      // Ignorar error de almacenamiento
    }
    onSalir();
  };

  if (partidaIniciada) {
    const cartaActual = cartasCantadas[cartasCantadas.length - 1] ?? null;
    const previas = cartasCantadas.slice(-4, -1); // las 3 anteriores a la actual
    const restanteMs = Math.max(0, DURACION_CARTA_MS - (ahora - getUltimaLlamada()));
    const restanteSeg = restanteMs / 1000;
    const anchoBarra = (100 * restanteMs) / DURACION_CARTA_MS;
    const aliasGanador = ganador
      ? (jugadores.find((j) => j.accountNumber === ganador.winner)?.alias ?? ganador.winner)
      : '';

    return (
      <StyledWrapper>
        {ganador && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
        <div className="tablero-contenedor">
          <h2>¡La partida ha comenzado!</h2>

          {modos.length > 0 && (
            <p className="modo-juego">
              Modo de juego: {modos.map((m) => ETIQUETAS_MODOS[m]).join(', ')}
            </p>
          )}

          {ganador && (
            <div className="banner-ganador">
              <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <TrophyIcon size={28} color="#d97706" />
                <span>¡Lotería!</span>
                <TrophyIcon size={28} color="#d97706" />
              </h2>
              <p>
                Ganó <strong>{aliasGanador}</strong> con {etiquetaDePatron(ganador.pattern)}
              </p>
            </div>
          )}

          <div className="panel-cartas">
            <div className="carta-actual">
              <h3>Carta actual</h3>
              {cartaActual ? (
                <>
                  {imagenDeCarta(cartaActual.id) ? (
                    <img src={imagenDeCarta(cartaActual.id)} alt={cartaActual.name} />
                  ) : (
                    <span className="sin-imagen">{cartaActual.name}</span>
                  )}
                  <span className="numero-nombre">
                    {cartaActual.id}. {cartaActual.name}
                  </span>
                </>
              ) : (
                <p className="cargando">Esperando la primera carta…</p>
              )}
              <div className="contador">
                <div className="barra">
                  <div className="progreso" style={{ width: `${anchoBarra}%` }} />
                </div>
                <span>
                  {restanteSeg > 0
                    ? `Siguiente carta en ${restanteSeg.toFixed(1)} s`
                    : 'Siguiente carta en camino…'}
                </span>
              </div>
            </div>

            <div className="previas">
              <h3>Cartas anteriores</h3>
              <div className="lista-previas">
                {previas.length === 0 ? (
                  <span className="cargando">Aún no hay cartas anteriores</span>
                ) : (
                  previas.map((carta) => (
                    <div className="previa" key={carta.id}>
                      {imagenDeCarta(carta.id) ? (
                        <img src={imagenDeCarta(carta.id)} alt={carta.name} />
                      ) : (
                        <span className="sin-imagen">{carta.name}</span>
                      )}
                      <span>
                        {carta.id}. {carta.name}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {tablero ? (
            <>
              <div className="tablero">
                {tablero.cards.map((carta) => {
                  const imagen = imagenDeCarta(carta.id);
                  const marcada = marcadas.includes(carta.id);
                  return (
                    <button
                      type="button"
                      key={carta.id}
                      className={marcada ? 'celda marcada' : 'celda'}
                      onClick={() => alternarCarta(carta.id)}
                      disabled={ganador !== null}
                    >
                      <div className="carta-contenedor">
                        {imagen ? (
                          <img src={imagen} alt={carta.name} />
                        ) : (
                          <span className="sin-imagen">{carta.name}</span>
                        )}
                        {marcada && (
                          <img src={frijolImg} alt="Frijolito marcador" className="frijol-marcador" />
                        )}
                      </div>
                      <span className="nombre-carta">{carta.name}</span>
                    </button>
                  );
                })}
              </div>
              <p className="cargando">Marca tus cartas cuando el cantor las nombre.</p>
            </>
          ) : (
            <p className="cargando">Esperando tu tablero…</p>
          )}

          <div className="feed-notificaciones">
            <h3>Jugadas de la sala</h3>
            {notificaciones.length === 0 ? (
              <p className="cargando">Aún no hay jugadas destacadas</p>
            ) : (
              <ul className="lista-notificaciones">
                {notificaciones.map((notif, index) => (
                  <li key={`${notif.accountNumber}-${index}`}>{notif.message}</li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="error-message">{error}</p>}

          {!ganador && (
            <button type="button" className="boton-loteria" onClick={cantar} disabled={cantando}>
              {cantando ? 'Verificando…' : '¡Lotería!'}
            </button>
          )}
        </div>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
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
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .waiting-container {
    max-width: 400px;
    background-color: #fff;
    padding: 32px 24px;
    font-size: 14px;
    font-family: inherit;
    color: #212121;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-sizing: border-box;
    border-radius: 10px;
    box-shadow:
      0px 0px 3px rgba(0, 0, 0, 0.084),
      0px 2px 3px rgba(0, 0, 0, 0.168);
    margin: 32px auto;
    text-align: center;
  }

  .codigo-fila {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  .codigo {
    font-size: 32px;
    font-weight: 700;
    letter-spacing: 4px;
    width: 100%;
    margin-bottom: 4px;
  }

  .boton-copiar,
  .boton-qr {
    padding: 8px 14px;
    border-radius: 8px;
    border: 1.5px solid var(--color-dark, #465D6B);
    background: #fff;
    color: var(--color-dark, #465D6B);
    font-family: inherit;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .boton-copiar:hover {
    background: rgba(70, 93, 107, 0.08);
  }

  .boton-qr {
    background-color: var(--color-dark, #465D6B);
    color: #fff;
    border-color: var(--color-dark, #465D6B);
  }

  .boton-qr:hover {
    filter: brightness(1.15);
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(70, 93, 107, 0.25);
  }

  .lista-jugadores {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .lista-jugadores li {
    padding: 8px;
    background: #f2f2f2;
    border-radius: 6px;
  }

  .cargando {
    color: #8b8e98;
    margin: 0;
  }

  .error-message {
    color: #e0245e;
    font-size: 13px;
    margin: 0;
    text-align: center;
  }

  .boton-iniciar {
    padding: 12px 16px;
    border: none;
    border-radius: 6px;
    background: #1a7f37;
    color: #fff;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }

  .boton-iniciar:hover {
    background: #1f8f3f;
  }

  .boton-iniciar:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .boton-salir {
    padding: 12px 16px;
    border: none;
    border-radius: 6px;
    background: #212121;
    color: #fff;
    font-family: inherit;
    font-size: 14px;
    cursor: pointer;
  }

  .boton-salir:hover {
    background: #313131;
  }

  /* --- Tablero de la partida --- */
  .tablero-contenedor {
    max-width: 760px;
    margin: 32px auto;
    padding: 24px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow:
      0px 0px 3px rgba(0, 0, 0, 0.084),
      0px 2px 3px rgba(0, 0, 0, 0.168);
    display: flex;
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .tablero {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .celda {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 8px;
    background: #fff;
    border: 2px solid #e5e4e7;
    border-radius: 10px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s ease;
    position: relative;

    &:hover {
      border-color: var(--color-blue, #81AEB7);
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    }
  }

  .carta-contenedor {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .celda img {
    width: 100%;
    aspect-ratio: 3 / 4;
    object-fit: cover;
    border-radius: 6px;
    display: block;
  }

  .celda .sin-imagen {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    aspect-ratio: 3 / 4;
    background: #f2f2f2;
    border-radius: 6px;
    font-size: 12px;
    padding: 4px;
  }

  .celda .nombre-carta {
    font-size: 12px;
    font-weight: 600;
    color: #212121;
  }

  .celda.marcada {
    border-color: var(--color-red, #D8575D);
    background: #fff6f4;
    box-shadow: 0 4px 12px rgba(216, 87, 93, 0.2);
  }

  .frijol-marcador {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(18deg);
    width: clamp(26px, 45%, 44px);
    height: auto;
    object-fit: contain;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.42));
    pointer-events: none;
    animation: frijolPop 0.24s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 3;
  }

  @keyframes frijolPop {
    0% {
      transform: translate(-50%, -50%) scale(0.3) rotate(0deg);
      opacity: 0;
    }
    75% {
      transform: translate(-50%, -50%) scale(1.15) rotate(22deg);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1) rotate(18deg);
      opacity: 1;
    }
  }

  .feed-notificaciones {
    border: 2px solid #e5e4e7;
    border-radius: 10px;
    padding: 12px 16px;
    text-align: left;
  }

  .feed-notificaciones h3 {
    margin: 0 0 8px;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #8b8e98;
    text-align: center;
  }

  .lista-notificaciones {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 180px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .lista-notificaciones li {
    padding: 8px 10px;
    background: #f6f3ea;
    border-radius: 6px;
    font-size: 13px;
    color: #212121;
    border-left: 3px solid #e0a800;
  }

  .modo-juego {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #1a7f37;
  }

  .banner-ganador {
    padding: 16px;
    border: 2px solid #e0a800;
    border-radius: 10px;
    background: #fff8e1;
  }

  .banner-ganador h2 {
    margin: 0 0 8px;
    font-size: 22px;
  }

  .banner-ganador p {
    margin: 0;
    font-size: 15px;
  }

  .boton-loteria {
    padding: 14px 32px;
    border: none;
    border-radius: 999px;
    background: linear-gradient(180deg, #e0a800 0%, #c79100 100%);
    color: #fff;
    font-family: inherit;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 1px;
    cursor: pointer;
    align-self: center;
  }

  .boton-loteria:hover {
    filter: brightness(1.05);
  }

  .boton-loteria:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* --- Panel de cartas cantadas --- */
  .panel-cartas {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    justify-content: center;
    align-items: flex-start;
  }

  .carta-actual {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    border: 2px solid #e5e4e7;
    border-radius: 10px;
    min-width: 180px;
  }

  .carta-actual h3,
  .previas h3 {
    margin: 0;
    font-size: 14px;
    color: #8b8e98;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .carta-actual img {
    width: 130px;
    aspect-ratio: 3 / 4;
    object-fit: cover;
    border-radius: 6px;
  }

  .carta-actual .numero-nombre {
    font-size: 18px;
    font-weight: 700;
  }

  .contador {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    max-width: 220px;
  }

  .contador span {
    font-size: 12px;
    color: #8b8e98;
    text-align: center;
  }

  .barra {
    width: 100%;
    height: 8px;
    background: #eee;
    border-radius: 999px;
    overflow: hidden;
  }

  .progreso {
    height: 100%;
    background: #1a7f37;
    transition: width 0.1s linear;
  }

  .previas {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    border: 2px solid #e5e4e7;
    border-radius: 10px;
    min-width: 220px;
  }

  .lista-previas {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .previa {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    font-size: 11px;
    color: #555;
    text-align: center;
  }

  .previa img {
    width: 52px;
    aspect-ratio: 3 / 4;
    object-fit: cover;
    border-radius: 4px;
  }
`;

export default WaitingRoom;

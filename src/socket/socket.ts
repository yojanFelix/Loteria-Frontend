import { io, type Socket } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';
import type { 
  DatosSala, 
  ModoJuego, 
  JugadorEnSala, 
  TableroJugador, 
  Carta, 
  ResumenSala, 
  GanadorInfo, 
  NotificacionJugada 
} from '../types/game.types';

// Re-exportamos tipos para compatibilidad
export type { DatosSala, ModoJuego, JugadorEnSala, TableroJugador, Carta, ResumenSala, GanadorInfo, NotificacionJugada };

const SERVER_URL = import.meta.env.VITE_API_URL;

interface AckResponse {
  ok: boolean;
  data?: unknown;
  message?: string;
}

type Ack = (response: AckResponse) => void;

export interface EstadoPartida {
  roomCode: string;
  status: string;
  calledCards: Carta[];
  lastCard: Carta | null;
  winner: string | null;
}

let socket: Socket | null = null;
let salaActual: string | null = null;

const cuentaLocal = () => localStorage.getItem('accountNumber') || '';

export const conectar = (): Socket => {
  if (socket && socket.connected) return socket;
  if (!socket) {
    const token = localStorage.getItem('token');
    socket = io(SERVER_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    // --- Configuración de Listeners del Store ---

    // Cambios en los jugadores de la sala
    socket.on('room:players', (payload: Array<{ accountNumber: string; alias: string }>) => {
      if (Array.isArray(payload)) {
        useGameStore.getState().setJugadoresEnSala(payload);
      }
    });

    // Eventos del lobby
    socket.on('rooms:list', (payload: ResumenSala[]) => {
      useGameStore.getState().setUltimasSalas(payload || []);
    });

    // Eventos de la partida
    socket.on('game:started', () => {
      useGameStore.getState().startGame();
    });

    // Llegada del tablero personal
    socket.on('game:board', (payload: TableroJugador) => {
      useGameStore.getState().setTablero(payload);
    });

    // Llegada de una carta cantada
    socket.on('card:called', (payload: { roomCode: string; card: Carta; calledCount: number }) => {
      useGameStore.getState().addCartaCantada(payload.card);
    });

    // Alguien grita lotería
    socket.on('game:finished', (payload: { roomCode: string; winner: string; pattern: string | null; winnerAlias?: string }) => {
      useGameStore.getState().setGanador({
        winner: payload.winner,
        pattern: payload.pattern,
        winnerAlias: payload.winnerAlias
      });
    });

    // Notificaciones de jugadas en tiempo real
    socket.on('room:notification', (payload: NotificacionJugada) => {
      useGameStore.getState().addNotificacion(payload);
    });
  }
  return socket;
};

export const pedirSalas = async (): Promise<ResumenSala[]> => {
  try {
    const res = (await emitirConAck('rooms:list', null)) as ResumenSala[];
    useGameStore.getState().setUltimasSalas(res || []);
    return res;
  } catch (err) {
    console.error('Error al pedir salas:', err);
    return useGameStore.getState().ultimasSalas;
  }
};

export const conectarSocket = (): void => {
  conectar();
};

export const desconectarSocket = (): void => {
  socket?.disconnect();
  socket = null;
  salaActual = null;
  useGameStore.getState().resetRoomState();
  useGameStore.getState().setUltimasSalas([]);
};

const emitirConAck = (evento: string, payload: unknown): Promise<unknown> => {
  const s = conectar();

  return new Promise((resolve, reject) => {
    const doEmit = () => {
      s.emit(evento, payload, ((respuesta: AckResponse) => {
        if (respuesta.ok) {
          resolve(respuesta.data);
        } else {
          reject(new Error(respuesta.message || 'Error del servidor'));
        }
      }) as Ack);
    };

    if (s.connected) {
      doEmit();
    } else {
      s.once('connect', doEmit);
      setTimeout(() => {
        if (!s.connected) {
          s.off('connect', doEmit);
          reject(new Error('Tiempo de espera agotado esperando conexión con el servidor'));
        }
      }, 5000);
    }
  });
};

export const crearSala = async (
  name: string,
  maxPlayers: number,
  alias: string,
  winModes: ModoJuego[],
): Promise<DatosSala> => {
  useGameStore.getState().resetRoomState();

  const sala = (await emitirConAck('room:create', { name, maxPlayers, alias, winModes })) as DatosSala;
  salaActual = sala.code;
  useGameStore.getState().setJugadoresEnSala([{ accountNumber: cuentaLocal(), alias }]);
  
  return sala;
};

export const unirseSala = async (code: string, alias: string): Promise<DatosSala> => {
  useGameStore.getState().resetRoomState();
  salaActual = code;

  try {
    const respuesta = (await emitirConAck('room:join', { code, alias })) as {
      room: DatosSala;
      aliases?: Record<string, string>;
      board?: TableroJugador;
      alreadyJoined?: boolean;
    };

    if (respuesta.aliases) {
      const arr = Object.entries(respuesta.aliases).map(([acc, al]) => ({ accountNumber: acc, alias: al }));
      useGameStore.getState().setJugadoresEnSala(arr);
    } else {
      useGameStore.getState().setJugadoresEnSala([{ accountNumber: cuentaLocal(), alias }]);
    }
    
    if (respuesta.room.status === 'PLAYING' || respuesta.room.status === 'FINISHED') {
      useGameStore.getState().startGame();
      if (respuesta.board) {
        useGameStore.getState().setTablero(respuesta.board);
      }
    }
    
    return respuesta.room;
  } catch (error) {
    salaActual = null;
    throw error;
  }
};

export const abandonarSala = async (code: string): Promise<void> => {
  await emitirConAck('room:leave', { code });
  if (salaActual === code) salaActual = null;
  useGameStore.getState().setJugadoresEnSala([]);
};

export const iniciarPartida = (code: string): Promise<{ roomCode: string; status: string }> =>
  emitirConAck('game:start', { code }) as Promise<{ roomCode: string; status: string }>;

export const pedirEstadoPartida = (code: string): Promise<EstadoPartida> =>
  emitirConAck('game:state', { code }) as Promise<EstadoPartida>;

export const sincronizarEstadoPartida = async (code: string): Promise<void> => {
  try {
    const estado = await pedirEstadoPartida(code);
    useGameStore.getState().setCartasHistorial(estado.calledCards || []);
  } catch {}
};

export const cantarLoteria = (code: string): Promise<{ winner: string; pattern: string }> =>
  emitirConAck('game:claim', { code }) as Promise<{ winner: string; pattern: string }>;

export const notificarJugada = (code: string, pattern: string): Promise<void> =>
  emitirConAck('room:notification', { code, pattern }).then(() => {});

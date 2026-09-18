import { create } from 'zustand';
import type { 
  TableroJugador, 
  Carta, 
  GanadorInfo, 
  NotificacionJugada, 
  ResumenSala, 
  JugadorEnSala 
} from '../types/game.types';

interface GameState {
  // Estado de la sala activa (Lobby)
  jugadoresEnSala: JugadorEnSala[];
  
  // Estado de la partida en curso
  tablero: TableroJugador | null;
  partidaIniciada: boolean;
  cartasCantadas: Carta[];
  ultimaLlamada: number;
  ganador: GanadorInfo | null;
  notificaciones: NotificacionJugada[];
  
  // Lista de salas globales (Menú principal)
  ultimasSalas: ResumenSala[];
  
  // --- Acciones (Mutadores) ---
  
  // Reseteo al entrar/salir de sala
  resetRoomState: () => void;
  
  // Actualizadores de sala
  setJugadoresEnSala: (jugadores: JugadorEnSala[]) => void;
  
  // Actualizadores de partida
  setTablero: (tablero: TableroJugador) => void;
  startGame: () => void;
  addCartaCantada: (carta: Carta) => void;
  setCartasHistorial: (cartas: Carta[]) => void;
  setGanador: (ganador: GanadorInfo) => void;
  addNotificacion: (notificacion: NotificacionJugada) => void;
  
  // Actualizadores globales
  setUltimasSalas: (salas: ResumenSala[]) => void;
}

const initialState = {
  jugadoresEnSala: [],
  tablero: null,
  partidaIniciada: false,
  cartasCantadas: [],
  ultimaLlamada: 0,
  ganador: null,
  notificaciones: [],
  ultimasSalas: []
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,
  
  resetRoomState: () => set({
    jugadoresEnSala: [],
    tablero: null,
    partidaIniciada: false,
    cartasCantadas: [],
    ultimaLlamada: 0,
    ganador: null,
    notificaciones: []
  }),
  
  setJugadoresEnSala: (jugadores) => set({ jugadoresEnSala: jugadores }),
  
  setTablero: (tablero) => set({ tablero }),
  
  startGame: () => set({ partidaIniciada: true }),
  
  addCartaCantada: (carta) => set((state) => {
    // Prevenir duplicados (común en recargas de HMR o React Strict Mode)
    if (state.cartasCantadas.some(c => c.id === carta.id)) {
      return state;
    }
    return { 
      cartasCantadas: [...state.cartasCantadas, carta],
      ultimaLlamada: Date.now()
    };
  }),
  
  setCartasHistorial: (cartas) => set({ 
    cartasCantadas: cartas,
    ultimaLlamada: Date.now()
  }),
  
  setGanador: (ganador) => set({ ganador }),
  
  addNotificacion: (notif) => set((state) => {
    // Evitar spam de notificaciones en UI limitando a las últimas 10
    const updated = [notif, ...state.notificaciones].slice(0, 10);
    return { notificaciones: updated };
  }),
  
  setUltimasSalas: (salas) => set({ ultimasSalas: salas })
}));

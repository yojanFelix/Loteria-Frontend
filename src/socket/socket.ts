import { io, type Socket } from 'socket.io-client'

// Backend: salas y partidas van por WebSockets; REST solo para auth y catálogo.
const SERVER_URL = import.meta.env.VITE_API_URL

export interface JugadorEnSala {
  accountNumber: string
  alias: string
}

export interface DatosSala {
  code: string
  name: string
  hostAccountNumber: string
  status: string
  maxPlayers: number
  winModes?: ModoJuego[]
}

interface AckResponse {
  ok: boolean
  data?: unknown
  message?: string
}

type Ack = (response: AckResponse) => void

let socket: Socket | null = null

// Sala en la que está metido el socket ahora mismo (para atribuir el
// broadcast room:players, que no trae el código de la sala en el payload).
let salaActual: string | null = null

// --- Estado de la partida en curso ---
// game:board llega por el canal personal del jugador; game:started es el
// broadcast a toda la sala cuando el host inicia.
export interface Carta {
  id: number
  name: string
  imgUrl?: string
}

export interface TableroJugador {
  accountNumber: string
  cards: Carta[]
}

let tablero: TableroJugador | null = null
let partidaIniciada = false
const suscriptoresPartida = new Set<() => void>()

const notificarPartida = (): void => {
  for (const cb of suscriptoresPartida) cb()
}

// --- Cartas cantadas (broadcast card:called) ---
// El backend canta una carta cada 4 s; guardamos el historial y el instante
// de la última para poder dibujar el contador en la UI.
let cartasCantadas: Carta[] = []
let ultimaLlamada = 0
const suscriptoresCartas = new Set<() => void>()

const notificarCartas = (): void => {
  for (const cb of suscriptoresCartas) cb()
}

export interface EstadoPartida {
  roomCode: string
  status: string
  calledCards: Carta[]
  lastCard: Carta | null
  winner: string | null
  winnerAlias: string | null
  winPattern: string | null
  players: { accountNumber: string; alias: string }[]
}

// --- Modo de juego (lo elige el host al crear la sala) ---
// Todos estos modos ya están soportados por el backend en checkVictory.
export type ModoJuego = 'LINE' | 'CORNERS' | 'CENTER_2X2' | 'SQUARE_2X2' | 'FULL_BOARD'

export const ETIQUETAS_MODOS: Record<ModoJuego, string> = {
  LINE: 'Chorro (una línea)',
  CORNERS: 'Cuatro esquinas',
  CENTER_2X2: 'Centro 2x2',
  SQUARE_2X2: 'Cuadrito 2x2',
  FULL_BOARD: 'Cartón lleno',
}

/** Traduce el patrón con el que ganó alguien a texto legible. */
export const etiquetaDePatron = (pattern: string | null): string => {
  const etiquetas: Record<string, string> = {
    LINE: 'Chorro (una línea)',
    CORNERS: 'Cuatro esquinas',
    FULL_BOARD: 'Cartón lleno',
    CENTER_2X2: 'Centro 2x2',
    SQUARE_2X2: 'Cuadrito 2x2',
  }
  return pattern ? (etiquetas[pattern] ?? pattern) : '—'
}

// --- Ganador (broadcast game:finished) ---
export interface GanadorInfo {
  winner: string
  pattern: string | null
  winnerAlias?: string
}

let ganador: GanadorInfo | null = null

// --- Feed de notificaciones de jugadas ---
// El backend arma el texto del mensaje (nadie escribe libremente).
export interface NotificacionJugada {
  accountNumber: string
  alias: string
  pattern: string
  message: string
}

let notificaciones: NotificacionJugada[] = []
const suscriptoresNotificaciones = new Set<(n: NotificacionJugada[]) => void>()

const notificarFeed = (): void => {
  for (const cb of suscriptoresNotificaciones) cb([...notificaciones])
}

// Última lista de jugadores conocida por sala. Se alimenta del broadcast
// room:players y de los acks de crear/unirse, así la sala de espera la lee
// al montarse sin perderse el evento que disparó su propio join.
const jugadoresPorSala = new Map<string, JugadorEnSala[]>()
const suscriptores = new Set<() => void>()

const notificar = (): void => {
  for (const cb of suscriptores) cb()
}

const cuentaLocal = (): string => localStorage.getItem('accountNumber') ?? ''

const conectar = (): Socket => {
  if (socket && socket.connected) return socket

  const token = localStorage.getItem('token')
  if (!token) throw new Error('No hay sesión activa')

  socket = io(SERVER_URL, { auth: { token } })

  socket.on('room:players', (jugadores: JugadorEnSala[]) => {
    if (!salaActual) return
    jugadoresPorSala.set(salaActual, jugadores)
    notificar()
  })

  socket.on('game:board', (board: TableroJugador) => {
    tablero = board
    notificarPartida()
  })

  socket.on('game:started', () => {
    partidaIniciada = true
    notificarPartida()
  })

  socket.on('card:called', (data: { card: Carta }) => {
    cartasCantadas.push(data.card)
    ultimaLlamada = Date.now()
    notificarCartas()
  })

  socket.on('game:finished', (data: GanadorInfo) => {
    ganador = data
    notificarPartida()
  })

  socket.on('rooms:updated', (salas: ResumenSala[]) => {
    ultimasSalas = salas || []
    notificarSalas()
  })

  socket.on('room:notification', (notificacion: NotificacionJugada) => {
    notificaciones.push(notificacion)
    notificarFeed()
  })

  return socket
}

export interface ResumenSala {
  code: string
  name: string
  hostAccountNumber: string
  players: number
  maxPlayers: number
}

let ultimasSalas: ResumenSala[] = []
const suscriptoresSalas = new Set<(salas: ResumenSala[]) => void>()

const notificarSalas = (): void => {
  for (const cb of suscriptoresSalas) cb(ultimasSalas)
}

/** Pide la lista de salas disponibles al servidor */
export const pedirSalasDisponibles = async (): Promise<ResumenSala[]> => {
  try {
    const res = (await emitirConAck('rooms:list', null)) as ResumenSala[]
    ultimasSalas = res || []
    notificarSalas()
    return ultimasSalas
  } catch (err) {
    console.error('Error al pedir salas:', err)
    return ultimasSalas
  }
}

/** Suscribe a cambios en las salas disponibles en tiempo real */
export const suscribirSalas = (cb: (salas: ResumenSala[]) => void): (() => void) => {
  suscriptoresSalas.add(cb)
  if (ultimasSalas.length > 0) cb(ultimasSalas)
  return () => {
    suscriptoresSalas.delete(cb)
  }
}

/** Conecta el socket tras el login. Debe llamarse con el token ya guardado. */
export const conectarSocket = (): void => {
  conectar()
}

/** Desconecta el socket y olvida el estado en memoria (logout). */
export const desconectarSocket = (): void => {
  socket?.disconnect()
  socket = null
  salaActual = null
  jugadoresPorSala.clear()
  tablero = null
  partidaIniciada = false
  cartasCantadas = []
  ultimaLlamada = 0
  ganador = null
  ultimasSalas = []
  suscriptoresSalas.clear()
  notificaciones = []
  suscriptoresNotificaciones.clear()
}

/** Emite un evento esperando su ack, convertido a Promise. */
const emitirConAck = (evento: string, payload: unknown): Promise<unknown> => {
  const s = conectar()

  return new Promise((resolve, reject) => {
    if (!s.connected) {
      reject(new Error('Sin conexión con el servidor'))
      return
    }

    s.emit(evento, payload, ((respuesta: AckResponse) => {
      if (respuesta.ok) {
        resolve(respuesta.data)
      } else {
        reject(new Error(respuesta.message || 'Error del servidor'))
      }
    }) as Ack)
  })
}

/** room:create — el backend exige name (3-30), alias (3-12) y una lista de
 *  winModes (los patrones que dan el premio); genera el código de sala. */
export const crearSala = async (
  name: string,
  maxPlayers: number,
  alias: string,
  winModes: ModoJuego[],
): Promise<DatosSala> => {
  const sala = (await emitirConAck('room:create', { name, maxPlayers, alias, winModes })) as DatosSala

  salaActual = sala.code
  // El broadcast del create llega antes del ack y sin código conocido; sembramos al host.
  jugadoresPorSala.set(sala.code, [{ accountNumber: cuentaLocal(), alias }])
  notificar()

  return sala
}

/** room:join — el backend exige alias (3-12, único en la sala). */
export const unirseSala = async (code: string, alias: string): Promise<DatosSala> => {
  // Optimista: el broadcast room:players del join llega antes que el ack.
  salaActual = code

  try {
    const respuesta = (await emitirConAck('room:join', { code, alias })) as {
      room: DatosSala
      aliases?: Record<string, string>
    }

    // Semilla con la lista completa que devuelve el join (por si el broadcast se perdió).
    if (respuesta.aliases) {
      jugadoresPorSala.set(
        code,
        Object.entries(respuesta.aliases).map(([accountNumber, aliasJugador]) => ({
          accountNumber,
          alias: aliasJugador,
        })),
      )
    } else {
      jugadoresPorSala.set(code, [{ accountNumber: cuentaLocal(), alias }])
    }
    notificar()

    return respuesta.room
  } catch (error) {
    salaActual = null
    throw error
  }
}

/** room:leave — el backend saca al jugador y avisa a la sala por broadcast. */
export const abandonarSala = async (code: string): Promise<void> => {
  await emitirConAck('room:leave', { code })
  if (salaActual === code) salaActual = null
  jugadoresPorSala.delete(code)
  notificar()
}

/** Lista de jugadores conocida para una sala. */
export const getJugadoresDeSala = (code: string): JugadorEnSala[] =>
  jugadoresPorSala.get(code) ?? []

/** Suscripción a cambios de jugadores; entrega el estado actual al suscribirse.
 *  Devuelve la función para cancelar. */
export const suscribirJugadores = (cb: () => void): (() => void) => {
  suscriptores.add(cb)
  cb()
  return () => {
    suscriptores.delete(cb)
  }
}

/** game:start — solo el host puede iniciar; el backend reparte tableros. */
export const iniciarPartida = (code: string): Promise<{ roomCode: string; status: string }> =>
  emitirConAck('game:start', { code }) as Promise<{ roomCode: string; status: string }>

/** Mi tablero (llega por el canal personal al iniciar la partida). */
export const getTablero = (): TableroJugador | null => tablero

/** true si la sala ya inició partida (broadcast game:started). */
export const getPartidaIniciada = (): boolean => partidaIniciada

/** Suscripción a cambios de la partida; entrega el estado actual al suscribirse. */
export const suscribirPartida = (cb: () => void): (() => void) => {
  suscriptoresPartida.add(cb)
  cb()
  return () => {
    suscriptoresPartida.delete(cb)
  }
}

/** game:state — pide el estado público de la partida (para sincronizarse al entrar). */
export const pedirEstadoPartida = (code: string): Promise<EstadoPartida> =>
  emitirConAck('game:state', { code }) as Promise<EstadoPartida>

/** Reemplaza el historial local con el del servidor (útil al montar la vista de juego). */
export const sincronizarEstadoPartida = async (code: string): Promise<void> => {
  try {
    const estado = await pedirEstadoPartida(code)
    cartasCantadas = estado.calledCards ?? []
    ultimaLlamada = Date.now()
    notificarCartas()
  } catch {
    // Si el backend aún no tiene la sesión, los próximos card:called sincronizarán
  }
}

/** game:claim — el jugador grita "¡Lotería!"; el servidor revalida su tablero. */
export const cantarLoteria = (code: string): Promise<{ winner: string; pattern: string }> =>
  emitirConAck('game:claim', { code }) as Promise<{ winner: string; pattern: string }>

/** Ganador de la partida (null si sigue en curso). */
export const getGanador = (): GanadorInfo | null => ganador

/** Historial de cartas cantadas, en orden. */
export const getCartasCantadas = (): Carta[] => cartasCantadas

/** Timestamp (ms) de la última carta cantada recibida; 0 si ninguna. */
export const getUltimaLlamada = (): number => ultimaLlamada

/** Suscripción a cambios de cartas cantadas; entrega el estado actual al suscribirse. */
export const suscribirCartas = (cb: () => void): (() => void) => {
  suscriptoresCartas.add(cb)
  cb()
  return () => {
    suscriptoresCartas.delete(cb)
  }
}

/** Historial de notificaciones de jugadas de la partida. */
export const getNotificaciones = (): NotificacionJugada[] => notificaciones

/** Suscripción al feed de notificaciones; entrega el estado actual al suscribirse. */
export const suscribirNotificaciones = (cb: (n: NotificacionJugada[]) => void): (() => void) => {
  suscriptoresNotificaciones.add(cb)
  cb([...notificaciones])
  return () => {
    suscriptoresNotificaciones.delete(cb)
  }
}

/** Avisa al servidor de una jugada; el servidor arma el mensaje y lo retransmite. */
export const notificarJugada = (code: string, pattern: string): Promise<void> =>
  emitirConAck('room:notification', { code, pattern }).then(() => {})

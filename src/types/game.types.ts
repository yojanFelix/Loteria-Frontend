export type ModoJuego =
  | 'LINE'       // chorro: fila o columna, en cualquier posicion
  | 'DIAGONAL'
  | 'ESCUADRA'
  | 'EQUIS'
  | 'CORNERS'
  | 'CENTER_2X2'
  | 'SQUARE_2X2' // cuadrito: en cualquier posicion
  | 'FULL_BOARD';

export interface JugadorEnSala {
  accountNumber: string;
  alias: string;
}

export interface DatosSala {
  code: string;
  name: string;
  hostAccountNumber: string;
  status: string;
  maxPlayers: number;
  winModes?: ModoJuego[];
}

export interface Carta {
  id: number;
  name: string;
  imgUrl?: string;
}

export interface TableroJugador {
  accountNumber: string;
  cards: Carta[];
}

export interface GanadorInfo {
  winner: string;
  pattern: string | null;
  winnerAlias?: string;
}

export interface NotificacionJugada {
  accountNumber: string;
  alias: string;
  pattern: string;
  message: string;
}

export interface ResumenSala {
  code: string;
  name: string;
  hostAccountNumber: string;
  players: number;
  maxPlayers: number;
}

import type { ModoJuego } from '../types/game.types';

export const ETIQUETAS_MODOS: Record<ModoJuego, string> = {
  LINE: 'Chorro (una línea)',
  DIAGONAL: 'Diagonal',
  ESCUADRA: 'Escuadra',
  EQUIS: 'Equis',
  CORNERS: 'Cuatro esquinas',
  CENTER_2X2: 'Centro 2x2',
  SQUARE_2X2: 'Cuadrito 2x2',
  FULL_BOARD: 'Cartón lleno',
};

/** Traduce el patrón con el que ganó alguien a texto legible. */
export const etiquetaDePatron = (pattern: string | null): string => {
  const etiquetas: Record<string, string> = ETIQUETAS_MODOS;
  return pattern && etiquetas[pattern] ? etiquetas[pattern] : 'Patrón desconocido';
};

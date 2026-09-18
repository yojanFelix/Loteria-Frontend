// Detección de patrones en el cliente, solo para el feed de notificaciones.
// El ganador lo decide SIEMPRE el servidor (game:claim); esto no lo reemplaza.

export interface CartaTablero {
  id: number
}

const LINEAS: number[][] = [
  [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15], // Horizontales
  [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15], // Verticales
  [0, 5, 10, 15], [3, 6, 9, 12], // Diagonales
]

const ESQUINAS = [0, 3, 12, 15]
const CENTRO_2X2 = [5, 6, 9, 10]
const CUADRITOS_2X2: number[][] = [
  [0, 1, 4, 5], [1, 2, 5, 6], [2, 3, 6, 7],
  [4, 5, 8, 9], [5, 6, 9, 10], [6, 7, 10, 11],
  [8, 9, 12, 13], [9, 10, 13, 14], [10, 11, 14, 15],
]

/**
 * Devuelve TODOS los patrones que el tablero tiene completos con las cartas
 * marcadas. Así se notifica cualquier jugada (línea, esquinas, etc.) aunque
 * no coincida con el modo de juego de la sala.
 */
export const patronesCompletados = (
  tablero: CartaTablero[],
  marcadas: number[],
): string[] => {
  if (!tablero || tablero.length !== 16) return []
  const marca = tablero.map((carta) => marcadas.includes(carta.id))

  const completados: string[] = []
  if (LINEAS.some((linea) => linea.every((i) => marca[i]))) completados.push('LINE')
  if (ESQUINAS.every((i) => marca[i])) completados.push('CORNERS')
  if (CENTRO_2X2.every((i) => marca[i])) completados.push('CENTER_2X2')
  if (CUADRITOS_2X2.some((cuadrito) => cuadrito.every((i) => marca[i]))) completados.push('SQUARE_2X2')
  if (marca.every(Boolean)) completados.push('FULL_BOARD')

  return completados
}

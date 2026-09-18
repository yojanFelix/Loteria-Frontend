import { useGameStore } from '../../../../store/gameStore';

/**
 * Marcador de la partida. Los patrones menores (chorro, esquinas, centro,
 * cuadrito) dan puntos y la partida sigue; la llena la cierra.
 * Gana quien acumule más puntos.
 */
export default function Scoreboard() {
  const jugadores = useGameStore((state) => state.jugadoresEnSala);
  const puntajes = useGameStore((state) => state.puntajes);

  if (jugadores.length === 0) return null;

  const tabla = [...jugadores]
    .map((jugador) => ({
      ...jugador,
      puntos: puntajes[jugador.accountNumber] ?? 0,
    }))
    .sort((a, b) => b.puntos - a.puntos);

  return (
    <div className="marcador">
      <h3>Marcador</h3>
      <ul className="lista-marcador">
        {tabla.map((jugador, index) => (
          <li key={jugador.accountNumber}>
            <span className="posicion">{index + 1}.</span>
            <span className="alias">{jugador.alias}</span>
            <span className="puntos">
              {jugador.puntos} {jugador.puntos === 1 ? 'punto' : 'puntos'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

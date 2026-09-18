import { useEffect } from 'react';
import styled from 'styled-components';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { useGameStore } from '../../store/gameStore';
import { sincronizarEstadoPartida } from '../../socket/socket';
import { ETIQUETAS_MODOS } from '../../utils/constants';
import type { ModoJuego } from '../../types/game.types';

import Lobby from './components/Lobby/Lobby';
import GameBoard from './components/GameBoard/GameBoard';
import EventFeed from './components/EventFeed/EventFeed';
import Scoreboard from './components/Scoreboard/Scoreboard';
import WinnerBanner from './components/WinnerBanner/WinnerBanner';

interface WaitingRoomProps {
  code: string;
  maxPlayers?: number;
  hostAccountNumber: string;
  modos: ModoJuego[];
  onSalir: () => void;
}

export default function WaitingRoom({ code, hostAccountNumber, modos, onSalir }: WaitingRoomProps) {
  const { 
    jugadoresEnSala: jugadores,
    partidaIniciada,
    ganador
  } = useGameStore();

  const { width, height } = useWindowSize();

  // Al entrar a la partida o si se reconecta
  useEffect(() => {
    if (partidaIniciada) {
      void sincronizarEstadoPartida(code);
    }
  }, [partidaIniciada, code]);

  const aliasGanador = ganador
    ? (jugadores.find((j) => j.accountNumber === ganador.winner)?.alias ?? ganador.winner)
    : '';

  return (
    <StyledWrapper>
      {partidaIniciada ? (
        <>
          {ganador && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
          <div className="tablero-contenedor">
            <h2>¡La partida ha comenzado!</h2>

            {modos.length > 0 && (
              <p className="modo-juego">
                Modo de juego: {modos.map((m) => ETIQUETAS_MODOS[m]).join(', ')}
              </p>
            )}

            {ganador && <WinnerBanner ganador={ganador} aliasGanador={aliasGanador} />}

            <GameBoard code={code} />

            <Scoreboard />

            <EventFeed />
          </div>
        </>
      ) : (
        <Lobby 
          code={code}
          hostAccountNumber={hostAccountNumber}
          modos={modos}
          onSalir={onSalir}
        />
      )}
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .waiting-container {
    max-width: 400px;
    background-color: #fff;
    padding: 32px 24px;
    border-radius: 12px;
    margin: 40px auto;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .waiting-container h2 {
    margin: 0;
    font-size: 24px;
    color: var(--color-dark, #465D6B);
    text-align: center;
  }

  .waiting-container h3 {
    margin: 10px 0 0;
    font-size: 16px;
    color: var(--color-dark, #465D6B);
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
    text-align: center;
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

  .marcador-img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(var(--rotacion, 18deg));
    width: 60% !important;
    max-width: 60px;
    height: auto !important;
    aspect-ratio: auto !important;
    object-fit: contain !important;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.42));
    pointer-events: none;
    animation: marcadorPop 0.24s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 3;
  }

  @keyframes marcadorPop {
    0% {
      transform: translate(-50%, -50%) scale(0.3) rotate(calc(var(--rotacion, 18deg) - 18deg));
      opacity: 0;
    }
    75% {
      transform: translate(-50%, -50%) scale(1.15) rotate(calc(var(--rotacion, 18deg) + 4deg));
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1) rotate(var(--rotacion, 18deg));
      opacity: 1;
    }
  }

  .marcador {
    border: 2px solid #e5e4e7;
    border-radius: 10px;
    padding: 12px 16px;
    text-align: left;
  }

  .marcador h3 {
    margin: 0 0 8px;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #8b8e98;
  }

  .lista-marcador {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .lista-marcador li {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 14px;
    color: var(--color-dark, #465D6B);
  }

  .lista-marcador .posicion {
    color: #8b8e98;
    min-width: 18px;
  }

  .lista-marcador .alias {
    flex: 1;
    overflow-wrap: anywhere;
  }

  .lista-marcador .puntos {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
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

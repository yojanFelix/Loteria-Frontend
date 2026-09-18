import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../../../store/gameStore';
import { imagenDeCarta } from '../../../../utils/cartas';
import { patronesCompletados } from '../../../../utils/patrones';
import { notificarJugada, cantarLoteria } from '../../../../socket/socket';
import { MARKER_OPTIONS, getSelectedMarkers, getRandomRotation } from '../../../../components/ConfigModal/ConfigModal';

const DURACION_CARTA_MS = 4000;

interface GameBoardProps {
  code: string;
}

export default function GameBoard({ code }: GameBoardProps) {
  const { 
    tablero,
    cartasCantadas,
    ganador,
    ultimaLlamada
  } = useGameStore();

  const [error, setError] = useState('');
  const [cantando, setCantando] = useState(false);
  const [ahora, setAhora] = useState(0);
  
  const [marcadas, setMarcadas] = useState<number[]>(() => {
    try {
      const guardadas = localStorage.getItem(`marcadas_${code}`);
      return guardadas ? JSON.parse(guardadas) : [];
    } catch {
      return [];
    }
  });

  const [selectedMarkers, setSelectedMarkers] = useState<string[]>(getSelectedMarkers());
  const [useRandomRotation, setUseRandomRotation] = useState<boolean>(getRandomRotation());
  
  useEffect(() => {
    const handleMarkersChanged = () => {
      setSelectedMarkers(getSelectedMarkers());
      setUseRandomRotation(getRandomRotation());
    };
    window.addEventListener('markersChanged', handleMarkersChanged);
    return () => window.removeEventListener('markersChanged', handleMarkersChanged);
  }, []);

  const patronesAnunciados = useRef(new Set<string>());

  const getMarkerImg = (cardId: number) => {
    const markerId = selectedMarkers[cardId % selectedMarkers.length];
    const option = MARKER_OPTIONS.find(m => m.id === markerId) || MARKER_OPTIONS[0];
    return option.img;
  };
  
  const getMarkerRotation = (cardId: number) => {
    if (!useRandomRotation) return 18;
    return (cardId * 101) % 360;
  };

  const alternarCarta = (id: number) => {
    const yaCantada = cartasCantadas.some((carta) => carta.id === id);
    if (!yaCantada) {
      setError('No puedes marcar esa carta: aún no ha sido cantada');
      return;
    }
    setError('');

    const isMarked = marcadas.includes(id);
    const nuevo = isMarked ? marcadas.filter((m) => m !== id) : [...marcadas, id];

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



    try {
      localStorage.setItem(`marcadas_${code}`, JSON.stringify(nuevo));
    } catch {}
    setMarcadas(nuevo);
  };

  useEffect(() => {
    if (cartasCantadas.length > 0) {
      const ultimaCarta = cartasCantadas[cartasCantadas.length - 1];
      if (ultimaCarta) {
        window.speechSynthesis.cancel();
        const speech = new SpeechSynthesisUtterance(ultimaCarta.name);
        speech.lang = 'es-MX';
        speech.rate = 1.1;
        window.speechSynthesis.speak(speech);
      }
    }
  }, [cartasCantadas]);

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(Date.now()), 100);
    return () => clearInterval(intervalo);
  }, []);

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

  const cartaActual = cartasCantadas[cartasCantadas.length - 1] ?? null;
  const previas = cartasCantadas.slice(-4, -1);
  const restanteMs = Math.max(0, DURACION_CARTA_MS - (ahora - ultimaLlamada));
  const restanteSeg = restanteMs / 1000;
  const anchoBarra = (100 * restanteMs) / DURACION_CARTA_MS;

  return (
    <>
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
                      <img 
                        src={getMarkerImg(carta.id)} 
                        alt="Marcador" 
                        className="marcador-img" 
                        style={{ '--rotacion': `${getMarkerRotation(carta.id)}deg` } as React.CSSProperties}
                      />
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

      {error && <p className="error-message">{error}</p>}

      {!ganador && (
        <button type="button" className="boton-loteria" onClick={cantar} disabled={cantando}>
          {cantando ? 'Verificando…' : '¡Lotería!'}
        </button>
      )}
    </>
  );
}

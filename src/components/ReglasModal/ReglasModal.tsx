import React from 'react';
import styled, { keyframes } from 'styled-components';
import { CloseIcon, BookOpenIcon, CheckIcon } from '../Icons/Icons';

interface ReglasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PatronRegla {
  id: string;
  nombre: string;
  descripcion: string;
  // Representación en matriz 4x4: índices de celdas activas (0 a 15)
  celdasActivas: number[];
}

const PATRONES: PatronRegla[] = [
  {
    id: 'LINE',
    nombre: 'Chorro (Línea)',
    descripcion: 'Completar cualquier fila horizontal, columna vertical o diagonal de 4 cartas.',
    celdasActivas: [0, 1, 2, 3], // Ejemplo fila
  },
  {
    id: 'CORNERS',
    nombre: 'Cuatro Esquinas',
    descripcion: 'Marcar las cartas ubicadas en las 4 esquinas exteriores del cartón.',
    celdasActivas: [0, 3, 12, 15],
  },
  {
    id: 'CENTER_2X2',
    nombre: 'Centro 2x2',
    descripcion: 'Marcar las 4 cartas que forman el cuadrado central de la tabla.',
    celdasActivas: [5, 6, 9, 10],
  },
  {
    id: 'SQUARE_2X2',
    nombre: 'Cuadrito 2x2',
    descripcion: 'Cualquier bloque cuadrado de 2x2 cartas en cualquier posición de la tabla.',
    celdasActivas: [1, 2, 5, 6],
  },
  {
    id: 'FULL_BOARD',
    nombre: 'Cartón Lleno (Llenas)',
    descripcion: 'Marcar las 16 cartas completas de tu cartón de juego.',
    celdasActivas: Array.from({ length: 16 }, (_, i) => i),
  },
];

export const ReglasModal: React.FC<ReglasModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose} aria-modal="true" role="dialog">
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <BotonCerrar onClick={onClose} aria-label="Cerrar reglas">
          <CloseIcon size={16} />
        </BotonCerrar>

        <Encabezado>
          <IconoHeader>
            <BookOpenIcon size={26} color="#3A7563" />
          </IconoHeader>
          <TituloModal>Reglas de la Lotería</TituloModal>
          <SubtituloModal>Aprende la dinámica tradicional y los patrones de victoria</SubtituloModal>
        </Encabezado>

        <ContenidoScroll>
          <Seccion>
            <TituloSeccion>1. ¿Cómo se juega?</TituloSeccion>
            <ListaPasos>
              <PasoItem>
                <PasoNumero>1</PasoNumero>
                <PasoTexto>
                  Cada jugador recibe un cartón aleatorio de <strong>16 cartas</strong> (cuadrícula de 4x4).
                </PasoTexto>
              </PasoItem>
              <PasoItem>
                <PasoNumero>2</PasoNumero>
                <PasoTexto>
                  El <em>cantor</em> saca una carta de la baraja cada <strong>4 segundos</strong> y la canta en pantalla.
                </PasoTexto>
              </PasoItem>
              <PasoItem>
                <PasoNumero>3</PasoNumero>
                <PasoTexto>
                  Si la carta cantada está en tu cartón, tócala para ponerle una ficha (frijolito).
                </PasoTexto>
              </PasoItem>
              <PasoItem>
                <PasoNumero>4</PasoNumero>
                <PasoTexto>
                  En cuanto completes el patrón acordado en la sala, pulsa el botón <strong>¡Lotería!</strong> antes que nadie.
                </PasoTexto>
              </PasoItem>
            </ListaPasos>
          </Seccion>

          <Seccion>
            <TituloSeccion>2. Patrones de Victoria</TituloSeccion>
            <GridPatrones>
              {PATRONES.map((p) => (
                <PatronCard key={p.id}>
                  <MiniTablero>
                    {Array.from({ length: 16 }).map((_, idx) => (
                      <MiniCelda key={idx} $activa={p.celdasActivas.includes(idx)} />
                    ))}
                  </MiniTablero>
                  <PatronDetalle>
                    <PatronNombre>{p.nombre}</PatronNombre>
                    <PatronDesc>{p.descripcion}</PatronDesc>
                  </PatronDetalle>
                </PatronCard>
              ))}
            </GridPatrones>
          </Seccion>

          <Seccion>
            <TituloSeccion>3. Validación y Ranking</TituloSeccion>
            <CajaValidacion>
              <CheckIcon size={20} color="#3A7563" />
              <p>
                Al gritar <strong>¡Lotería!</strong>, el servidor comprueba que todas las cartas marcadas
                hayan sido efectivamente cantadas. Las victorias confirmadas se registran en tu cuenta y suman puntos a la <strong>Tabla de Clasificación</strong>.
              </p>
            </CajaValidacion>
          </Seccion>
        </ContenidoScroll>
      </ModalCard>
    </Overlay>
  );
};

export default ReglasModal;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleUp = keyframes`
  from {
    opacity: 0;
    transform: scale(0.94) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(30, 42, 50, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 16px;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalCard = styled.div`
  background-color: #FFFDF9;
  border-radius: 20px;
  padding: 28px 24px;
  max-width: 620px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  border: 2px solid rgba(70, 93, 107, 0.15);
  animation: ${scaleUp} 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
`;

const BotonCerrar = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  background: rgba(70, 93, 107, 0.1);
  border: none;
  color: var(--color-dark, #465D6B);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(216, 87, 93, 0.15);
    color: var(--color-red, #D8575D);
    transform: rotate(90deg);
  }
`;

const Encabezado = styled.div`
  text-align: center;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const IconoHeader = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(58, 117, 99, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
`;

const TituloModal = styled.h3`
  font-family: var(--font-theme, 'Pattaya', cursive);
  color: var(--color-dark, #465D6B);
  font-size: 28px;
  margin: 0 0 4px;
`;

const SubtituloModal = styled.p`
  font-family: var(--font-sans, system-ui);
  color: rgba(70, 93, 107, 0.8);
  font-size: 14px;
  margin: 0 0 8px;
`;

const ContenidoScroll = styled.div`
  overflow-y: auto;
  max-height: 55vh;
  padding-right: 6px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(70, 93, 107, 0.2);
    border-radius: 3px;
  }
`;

const Seccion = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TituloSeccion = styled.h4`
  margin: 0;
  font-family: var(--font-sans, system-ui);
  font-size: 16px;
  font-weight: 700;
  color: var(--color-dark, #465D6B);
  border-bottom: 1.5px solid rgba(70, 93, 107, 0.15);
  padding-bottom: 6px;
`;

const ListaPasos = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PasoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const PasoNumero = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-dark, #465D6B);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
`;

const PasoTexto = styled.p`
  margin: 2px 0 0;
  font-family: var(--font-sans, system-ui);
  font-size: 14px;
  line-height: 1.4;
  color: #33424d;
`;

const GridPatrones = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const PatronCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  background: #ffffff;
  border: 1.5px solid rgba(70, 93, 107, 0.12);
  border-radius: 12px;
  padding: 10px 14px;
`;

const MiniTablero = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 11px);
  grid-template-rows: repeat(4, 11px);
  gap: 2.5px;
  background: rgba(70, 93, 107, 0.1);
  padding: 4px;
  border-radius: 6px;
  flex-shrink: 0;
`;

const MiniCelda = styled.div<{ $activa: boolean }>`
  width: 11px;
  height: 11px;
  border-radius: 2px;
  background-color: ${(props) => (props.$activa ? 'var(--color-red, #D8575D)' : '#e4e8eb')};
`;

const PatronDetalle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const PatronNombre = styled.span`
  font-family: var(--font-sans, system-ui);
  font-size: 14px;
  font-weight: 700;
  color: var(--color-dark, #465D6B);
`;

const PatronDesc = styled.span`
  font-family: var(--font-sans, system-ui);
  font-size: 13px;
  color: rgba(70, 93, 107, 0.85);
`;

const CajaValidacion = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: rgba(58, 117, 99, 0.1);
  border: 1.5px solid rgba(58, 117, 99, 0.25);
  border-radius: 12px;
  padding: 12px 14px;

  p {
    margin: 0;
    font-family: var(--font-sans, system-ui);
    font-size: 13.5px;
    line-height: 1.45;
    color: #274d41;
  }
`;

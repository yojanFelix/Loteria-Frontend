import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { CloseIcon, RoomIcon, RefreshIcon, UsersIcon } from '../Icons/Icons';
import { pedirSalas } from '../../socket/socket';
import { useGameStore } from '../../store/gameStore';

interface SalasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnirse: (codigo: string) => void;
}

export const SalasModal: React.FC<SalasModalProps> = ({ isOpen, onClose, onUnirse }) => {
  const salas = useGameStore(state => state.ultimasSalas);
  const [cargando, setCargando] = useState(true);
  const [codigoUniendo, setCodigoUniendo] = useState<string | null>(null);

  const cargarSalas = async () => {
    setCargando(true);
    try {
      await pedirSalas();
    } catch (err) {
      console.error('Error cargando salas:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void cargarSalas();
    }
  }, [isOpen]);

  const handleUnirse = async (code: string) => {
    setCodigoUniendo(code);
    try {
      await onUnirse(code);
    } finally {
      setCodigoUniendo(null);
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose} aria-modal="true" role="dialog">
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <BotonCerrar onClick={onClose} aria-label="Cerrar salas">
          <CloseIcon size={16} />
        </BotonCerrar>

        <Encabezado>
          <IconoHeader>
            <RoomIcon size={24} color="#D8575D" />
          </IconoHeader>
          <TituloModal>Salas Disponibles</TituloModal>
          <SubtituloModal>Únete a una partida activa en espera de jugadores</SubtituloModal>
          <BotonRefrescar onClick={cargarSalas} disabled={cargando} title="Actualizar lista">
            <RefreshIcon size={16} className={cargando ? 'anim-spin' : ''} />
            <span>Actualizar</span>
          </BotonRefrescar>
        </Encabezado>

        <ListaContenedor>
          {cargando && salas.length === 0 ? (
            <EstadoVacio>
              <RefreshIcon size={28} className="anim-spin" color="#465D6B" />
              <p>Buscando salas disponibles...</p>
            </EstadoVacio>
          ) : salas.length === 0 ? (
            <EstadoVacio>
              <RoomIcon size={40} color="#81AEB7" />
              <p className="vacio-titulo">No hay salas abiertas en este momento</p>
              <p className="vacio-sub">¡Crea tu propia sala desde el menú principal para comenzar!</p>
            </EstadoVacio>
          ) : (
            <GridSalas>
              {salas.map((sala) => (
                <SalaCard key={sala.code}>
                  <SalaInfo>
                    <SalaNombre>{sala.name}</SalaNombre>
                    <SalaMeta>
                      <CodigoBadge>{sala.code}</CodigoBadge>
                      <JugadoresBadge>
                        <UsersIcon size={14} color="#3A7563" />
                        <span>{sala.players} {sala.players === 1 ? 'jugador' : 'jugadores'}</span>
                      </JugadoresBadge>
                    </SalaMeta>
                  </SalaInfo>

                  <BotonUnirse
                    onClick={() => handleUnirse(sala.code)}
                    disabled={codigoUniendo === sala.code}
                  >
                    {codigoUniendo === sala.code ? 'Entrando...' : 'Unirse'}
                  </BotonUnirse>
                </SalaCard>
              ))}
            </GridSalas>
          )}
        </ListaContenedor>
      </ModalCard>
    </Overlay>
  );
};

export default SalasModal;

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

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
  max-width: 580px;
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
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const IconoHeader = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(216, 87, 93, 0.1);
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
  margin: 0 0 12px;
`;

const BotonRefrescar = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(129, 174, 183, 0.15);
  color: var(--color-dark, #465D6B);
  border: 1px solid rgba(70, 93, 107, 0.2);
  border-radius: 16px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(129, 174, 183, 0.3);
    transform: translateY(-1px);
  }

  .anim-spin {
    animation: ${spin} 0.9s linear infinite;
  }
`;

const ListaContenedor = styled.div`
  overflow-y: auto;
  max-height: 50vh;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(70, 93, 107, 0.2);
    border-radius: 3px;
  }
`;

const GridSalas = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SalaCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border: 1.5px solid rgba(70, 93, 107, 0.15);
  border-radius: 14px;
  padding: 14px 18px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(216, 87, 93, 0.4);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
  }
`;

const SalaInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SalaNombre = styled.h4`
  margin: 0;
  font-family: var(--font-sans, system-ui);
  font-size: 16px;
  font-weight: 700;
  color: var(--color-dark, #465D6B);
`;

const SalaMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const CodigoBadge = styled.span`
  font-family: monospace;
  font-size: 13px;
  font-weight: 700;
  background: rgba(216, 87, 93, 0.12);
  color: var(--color-red, #D8575D);
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.8px;
`;

const JugadoresBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-sans, system-ui);
  font-size: 13px;
  color: #3A7563;
  font-weight: 600;
`;

const BotonUnirse = styled.button`
  background-color: var(--color-red, #D8575D);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  font-family: var(--font-sans, system-ui);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background-color: #b94247;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(216, 87, 93, 0.35);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const EstadoVacio = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  text-align: center;
  color: rgba(70, 93, 107, 0.7);

  .vacio-titulo {
    font-size: 16px;
    font-weight: 700;
    color: var(--color-dark, #465D6B);
    margin: 12px 0 4px;
  }

  .vacio-sub {
    font-size: 13px;
    margin: 0;
  }

  .anim-spin {
    animation: ${spin} 1s linear infinite;
  }
`;

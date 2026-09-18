import React from 'react';
import styled, { keyframes } from 'styled-components';
import { CloseIcon, ArrowLeftIcon, RoomIcon } from '../Icons/Icons';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIrAlMenu: () => void;
  onAbandonarSala: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onIrAlMenu,
  onAbandonarSala,
}) => {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose} aria-modal="true" role="dialog">
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <BotonCerrar onClick={onClose} aria-label="Cerrar">
          <CloseIcon size={16} />
        </BotonCerrar>

        <IconoAlerta>
          <RoomIcon size={28} color="#D8575D" />
        </IconoAlerta>

        <TituloModal>¿Volver al menú principal?</TituloModal>
        <MensajeModal>
          Tienes una sala o partida activa. Puedes volver al menú y reincorporarte más tarde, o abandonar la sala definitivamente.
        </MensajeModal>

        <GrupoBotones>
          <BotonMenu type="button" onClick={onIrAlMenu}>
            <ArrowLeftIcon size={16} />
            <span>Ir al menú (mantener sala)</span>
          </BotonMenu>

          <BotonAbandonar type="button" onClick={onAbandonarSala}>
            <span>Abandonar sala definitivamente</span>
          </BotonAbandonar>

          <BotonCancelar type="button" onClick={onClose}>
            <span>Continuar jugando</span>
          </BotonCancelar>
        </GrupoBotones>
      </ModalCard>
    </Overlay>
  );
};

export default ConfirmModal;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleUp = keyframes`
  from {
    opacity: 0;
    transform: scale(0.92) translateY(8px);
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
  z-index: 10000;
  padding: 16px;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalCard = styled.div`
  background-color: #FFFDF9;
  border-radius: 20px;
  padding: 28px 24px;
  max-width: 440px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  border: 2px solid rgba(70, 93, 107, 0.15);
  animation: ${scaleUp} 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275);
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

const IconoAlerta = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(216, 87, 93, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const TituloModal = styled.h3`
  font-family: var(--font-theme, 'Pattaya', cursive);
  color: var(--color-dark, #465D6B);
  font-size: 26px;
  margin: 0 0 8px;
`;

const MensajeModal = styled.p`
  font-family: var(--font-sans, system-ui);
  color: rgba(70, 93, 107, 0.85);
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 20px;
`;

const GrupoBotones = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const BotonMenu = styled.button`
  width: 100%;
  padding: 12px 18px;
  background-color: var(--color-dark, #465D6B);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-family: var(--font-sans, system-ui);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(70, 93, 107, 0.3);
  }
`;

const BotonAbandonar = styled.button`
  width: 100%;
  padding: 11px 18px;
  background-color: transparent;
  color: var(--color-red, #D8575D);
  border: 1.5px solid rgba(216, 87, 93, 0.4);
  border-radius: 12px;
  font-family: var(--font-sans, system-ui);
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(216, 87, 93, 0.08);
    border-color: var(--color-red, #D8575D);
  }
`;

const BotonCancelar = styled.button`
  width: 100%;
  padding: 10px 18px;
  background-color: transparent;
  color: rgba(70, 93, 107, 0.7);
  border: none;
  border-radius: 12px;
  font-family: var(--font-sans, system-ui);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--color-dark, #465D6B);
  }
`;

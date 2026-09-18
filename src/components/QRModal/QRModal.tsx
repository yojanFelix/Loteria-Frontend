import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import QRCode from 'qrcode';
import { CloseIcon, LinkIcon, CheckIcon } from '../Icons/Icons';

interface QRModalProps {
  code: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({ code, isOpen, onClose }) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copiado, setCopiado] = useState(false);

  // Generar URL completa para unirse
  const joinUrl = `${window.location.origin}/?join=${encodeURIComponent(code)}`;

  useEffect(() => {
    if (!isOpen || !code) return;

    QRCode.toDataURL(joinUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#465D6B',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrUrl(url))
      .catch((err) => console.error('Error generando QR:', err));
  }, [code, isOpen, joinUrl]);

  const copiarEnlace = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(joinUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = joinUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      console.error('Error al copiar enlace');
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose} aria-modal="true" role="dialog">
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <BotonCerrar onClick={onClose} aria-label="Cerrar ventana">
          <CloseIcon size={16} />
        </BotonCerrar>

        <TituloModal>Únete con Código QR</TituloModal>
        <SubtituloModal>Escanea este código con la cámara de tu teléfono:</SubtituloModal>

        <QRFrame>
          {qrUrl ? (
            <img src={qrUrl} alt={`Código QR para unirse a la sala ${code}`} className="qr-img" />
          ) : (
            <div className="qr-placeholder">Generando código...</div>
          )}
        </QRFrame>

        <CodigoBadge>
          Código de sala: <strong>{code}</strong>
        </CodigoBadge>

        <BotonCopiarEnlace type="button" onClick={copiarEnlace}>
          {copiado ? (
            <>
              <CheckIcon size={16} />
              <span>¡Enlace copiado!</span>
            </>
          ) : (
            <>
              <LinkIcon size={16} />
              <span>Copiar enlace de invitación</span>
            </>
          )}
        </BotonCopiarEnlace>
      </ModalCard>
    </Overlay>
  );
};

export default QRModal;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleUp = keyframes`
  from {
    opacity: 0;
    transform: scale(0.92) translateY(10px);
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
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
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
  font-size: 16px;
  font-weight: bold;
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

const TituloModal = styled.h3`
  font-family: var(--font-theme, 'Pattaya', cursive);
  color: var(--color-dark, #465D6B);
  font-size: 26px;
  margin: 0 0 6px;
  text-align: center;
`;

const SubtituloModal = styled.p`
  font-family: var(--font-sans, system-ui);
  color: rgba(70, 93, 107, 0.8);
  font-size: 14px;
  margin: 0 0 16px;
  text-align: center;
`;

const QRFrame = styled.div`
  background: #ffffff;
  padding: 12px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border: 2px solid rgba(129, 174, 183, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 240px;
  height: 240px;
  margin-bottom: 16px;

  .qr-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 8px;
  }

  .qr-placeholder {
    font-family: var(--font-sans, system-ui);
    font-size: 14px;
    color: rgba(70, 93, 107, 0.6);
  }
`;

const CodigoBadge = styled.div`
  font-family: var(--font-sans, system-ui);
  font-size: 15px;
  color: var(--color-dark, #465D6B);
  background: rgba(129, 174, 183, 0.15);
  padding: 6px 14px;
  border-radius: 20px;
  margin-bottom: 14px;

  strong {
    letter-spacing: 1.5px;
    font-family: monospace;
    font-size: 16px;
    color: var(--color-red, #D8575D);
  }
`;

const BotonCopiarEnlace = styled.button`
  width: 100%;
  padding: 12px 18px;
  background-color: var(--color-dark, #465D6B);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-family: var(--font-sans, system-ui);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(70, 93, 107, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

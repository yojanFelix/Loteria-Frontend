import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { CloseIcon, TrophyIcon } from '../Icons/Icons';

interface PerfilUsuario {
  accountNumber: string;
  name: string;
  totalWins: number;
}

interface PerfilModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PerfilModal: React.FC<PerfilModalProps> = ({ isOpen, onClose }) => {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarPerfil = async () => {
    setCargando(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json();
      if (data.ok && data.data) {
        setPerfil(data.data);
      } else {
        setError(data.message || 'Error al obtener el perfil');
      }
    } catch (err) {
      console.error('Error al consultar perfil:', err);
      setError('No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      cargarPerfil();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose} aria-modal="true" role="dialog">
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <BotonCerrar onClick={onClose} aria-label="Cerrar perfil">
          <CloseIcon size={16} />
        </BotonCerrar>

        <Encabezado>
          <TituloModal>Mi Perfil</TituloModal>
        </Encabezado>

        <Contenido>
          {cargando ? (
            <p>Cargando perfil...</p>
          ) : error ? (
            <p className="error-texto">{error}</p>
          ) : perfil ? (
            <DetallesPerfil>
              <Avatar>
                {perfil.name.charAt(0).toUpperCase()}
              </Avatar>
              <h2>{perfil.name}</h2>
              <p className="cuenta">Cuenta: {perfil.accountNumber}</p>
              
              <Estadisticas>
                <StatCard>
                  <TrophyIcon size={32} color="#ECA827" />
                  <span className="stat-valor">{perfil.totalWins}</span>
                  <span className="stat-label">Victorias</span>
                </StatCard>
              </Estadisticas>
            </DetallesPerfil>
          ) : null}
        </Contenido>
      </ModalCard>
    </Overlay>
  );
};

export default PerfilModal;

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
  max-width: 400px;
  width: 100%;
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
`;

const TituloModal = styled.h3`
  font-family: var(--font-theme, 'Pattaya', cursive);
  color: var(--color-dark, #465D6B);
  font-size: 28px;
  margin: 0;
`;

const Contenido = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  
  .error-texto {
    color: var(--color-red, #D8575D);
    font-weight: 600;
  }
`;

const DetallesPerfil = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  
  h2 {
    margin: 8px 0 0;
    color: #212121;
  }
  
  .cuenta {
    font-family: monospace;
    font-size: 14px;
    color: #666;
    margin: 0 0 16px;
    background: rgba(70, 93, 107, 0.07);
    padding: 4px 8px;
    border-radius: 6px;
  }
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #ECA827;
  color: white;
  font-size: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
`;

const Estadisticas = styled.div`
  display: flex;
  gap: 16px;
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f2f2f2;
  padding: 16px 24px;
  border-radius: 12px;
  
  .stat-valor {
    font-size: 24px;
    font-weight: bold;
    color: #1a7f37;
  }
  
  .stat-label {
    font-size: 12px;
    color: #8b8e98;
    text-transform: uppercase;
  }
`;

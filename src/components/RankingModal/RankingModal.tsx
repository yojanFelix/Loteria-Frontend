import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { CloseIcon, TrophyIcon, MedalIcon, RefreshIcon } from '../Icons/Icons';

interface RankingUsuario {
  rank: number;
  accountNumber: string;
  name: string;
  totalWins: number;
}

interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RankingModal: React.FC<RankingModalProps> = ({ isOpen, onClose }) => {
  const [ranking, setRanking] = useState<RankingUsuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const miCuenta = localStorage.getItem('accountNumber') || '';

  const cargarRanking = async () => {
    setCargando(true);
    setError(null);
    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/users/ranking`);
      const data = await resp.json();
      if (data.ok && Array.isArray(data.data)) {
        const rankingFiltrado = data.data.filter((user: RankingUsuario) => user.totalWins > 0);
        setRanking(rankingFiltrado);
      } else {
        setError(data.message || 'Error al obtener la tabla de clasificación');
      }
    } catch (err) {
      console.error('Error al consultar ranking:', err);
      setError('No se pudo conectar con el servidor para consultar las clasificaciones.');
    } finally {
      setCargando(false);
    }
  };
  useEffect(() => {
    if (isOpen) {
      cargarRanking();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose} aria-modal="true" role="dialog">
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <BotonCerrar onClick={onClose} aria-label="Cerrar ranking">
          <CloseIcon size={16} />
        </BotonCerrar>

        <Encabezado>
          <IconoHeader>
            <TrophyIcon size={26} color="#ECA827" />
          </IconoHeader>
          <TituloModal>Tabla de Clasificación</TituloModal>
          <SubtituloModal>Jugadores con más victorias en la Lotería Mexicana</SubtituloModal>
          <BotonRefrescar onClick={cargarRanking} disabled={cargando}>
            <RefreshIcon size={15} className={cargando ? 'anim-spin' : ''} />
            <span>Actualizar</span>
          </BotonRefrescar>
        </Encabezado>

        <Contenido>
          {cargando ? (
            <EstadoInfo>
              <RefreshIcon size={28} className="anim-spin" color="#465D6B" />
              <p>Cargando posiciones...</p>
            </EstadoInfo>
          ) : error ? (
            <EstadoInfo>
              <p className="error-texto">{error}</p>
            </EstadoInfo>
          ) : ranking.length === 0 ? (
            <EstadoInfo>
              <TrophyIcon size={36} color="#81AEB7" />
              <p className="vacio-titulo">Aún no hay partidas registradas</p>
              <p className="vacio-sub">¡Sé el primero en ganar una partida para encabezar la tabla!</p>
            </EstadoInfo>
          ) : (
            <TablaScroll>
              <TablaRanking>
                <thead>
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }}>Pos</th>
                    <th>Jugador</th>
                    <th style={{ textAlign: 'center', width: '110px' }}>Cuenta</th>
                    <th style={{ textAlign: 'right', width: '100px' }}>Victorias</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((user) => {
                    const esMiUsuario = user.accountNumber === miCuenta;
                    return (
                      <FilaUsuario key={user.accountNumber} $esMio={esMiUsuario}>
                        <td style={{ textAlign: 'center' }}>
                          <PuestoBadge $rank={user.rank}>
                            {user.rank === 1 && <TrophyIcon size={14} color="#D88A10" />}
                            {user.rank === 2 && <MedalIcon size={14} color="#7E8B93" />}
                            {user.rank === 3 && <MedalIcon size={14} color="#A6682F" />}
                            <span>#{user.rank}</span>
                          </PuestoBadge>
                        </td>
                        <td>
                          <NombreUsuario $esMio={esMiUsuario}>
                            {user.name}
                            {esMiUsuario && <TuBadge>(Tú)</TuBadge>}
                          </NombreUsuario>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <CuentaBadge>{user.accountNumber}</CuentaBadge>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <VictoriasBadge $destacado={user.totalWins > 0}>
                            {user.totalWins} {user.totalWins === 1 ? 'victoria' : 'victorias'}
                          </VictoriasBadge>
                        </td>
                      </FilaUsuario>
                    );
                  })}
                </tbody>
              </TablaRanking>
            </TablaScroll>
          )}
        </Contenido>
      </ModalCard>
    </Overlay>
  );
};

export default RankingModal;

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
  background: rgba(236, 168, 39, 0.15);
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
  padding: 5px 14px;
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

const Contenido = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 200px;
`;

const TablaScroll = styled.div`
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

const TablaRanking = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-sans, system-ui);

  th {
    padding: 10px 12px;
    font-size: 13px;
    font-weight: 700;
    color: var(--color-dark, #465D6B);
    border-bottom: 2px solid rgba(70, 93, 107, 0.15);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  td {
    padding: 12px;
    border-bottom: 1px solid rgba(70, 93, 107, 0.08);
  }
`;

const FilaUsuario = styled.tr<{ $esMio: boolean }>`
  background: ${(props) => (props.$esMio ? 'rgba(236, 168, 39, 0.12)' : 'transparent')};
  transition: background 0.15s ease;

  &:hover {
    background: ${(props) => (props.$esMio ? 'rgba(236, 168, 39, 0.2)' : 'rgba(70, 93, 107, 0.04)')};
  }
`;

const PuestoBadge = styled.div<{ $rank: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-weight: 800;
  font-size: 13px;
  color: ${(props) => {
    if (props.$rank === 1) return '#B8740B';
    if (props.$rank === 2) return '#5A6A74';
    if (props.$rank === 3) return '#91531D';
    return 'var(--color-dark, #465D6B)';
  }};
`;

const NombreUsuario = styled.div<{ $esMio: boolean }>`
  font-size: 14px;
  font-weight: ${(props) => (props.$esMio ? '700' : '600')};
  color: var(--color-dark, #465D6B);
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TuBadge = styled.span`
  font-size: 11px;
  background: var(--color-red, #D8575D);
  color: #ffffff;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 700;
`;

const CuentaBadge = styled.span`
  font-family: monospace;
  font-size: 12px;
  color: rgba(70, 93, 107, 0.75);
  background: rgba(70, 93, 107, 0.07);
  padding: 2px 6px;
  border-radius: 4px;
`;

const VictoriasBadge = styled.span<{ $destacado: boolean }>`
  font-size: 13px;
  font-weight: 700;
  color: ${(props) => (props.$destacado ? '#3A7563' : 'rgba(70, 93, 107, 0.6)')};
`;

const EstadoInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 16px;
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

  .error-texto {
    color: var(--color-red, #D8575D);
    font-weight: 600;
  }

  .anim-spin {
    animation: ${spin} 1s linear infinite;
  }
`;

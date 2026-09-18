import React from 'react';
import styled from 'styled-components';
import papel1 from '../../assets/theme/papel-1.png';
import papel2 from '../../assets/theme/papel-2.png';

interface PapelPicadoProps {
  className?: string;
}

export const PapelPicado: React.FC<PapelPicadoProps> = ({ className }) => {
  return (
    <BannerContainer className={className} aria-hidden="true">
      <BannerTrack>
        {/* Serie intercalada para cubrir desde móviles hasta monitores ultrawide */}
        <img src={papel1} alt="" className="papel-item papel-tipo-1" />
        <img src={papel2} alt="" className="papel-item papel-tipo-2" />
        <img src={papel1} alt="" className="papel-item papel-tipo-1" />
        <img src={papel2} alt="" className="papel-item papel-tipo-2" />
        <img src={papel1} alt="" className="papel-item papel-tipo-1" />
        <img src={papel2} alt="" className="papel-item papel-tipo-2" />
      </BannerTrack>
    </BannerContainer>
  );
};

export default PapelPicado;

const BannerContainer = styled.div`
  width: 100vw;
  max-width: 100vw;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
  overflow: hidden;
  pointer-events: none;
  user-select: none;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  /* Escala proporcional: grande y festivo, adaptable a móvil y PC */
  height: clamp(75px, 11vw, 125px);
  margin-top: -2px;
  margin-bottom: 8px;
  position: relative;
  z-index: 2;
`;

const BannerTrack = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  height: 100%;
  flex-shrink: 0;

  .papel-item {
    height: 100%;
    width: auto;
    object-fit: contain;
    object-position: top center;
    flex-shrink: 0;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.09));
    margin: 0 -3px;
  }

  .papel-tipo-1 {
    transform: translateY(0);
  }

  .papel-tipo-2 {
    transform: translateY(-2px);
  }
`;

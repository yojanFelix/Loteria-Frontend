import React from 'react';
import styled, { keyframes } from 'styled-components';
import guitarraImg from '../../assets/theme/guitarra.png';
import sombreroImg from '../../assets/theme/sombrero.png';
import calaveritaImg from '../../assets/theme/calaverita.png';

interface FestiveDecorationsProps {
  variant?: 'login' | 'lobby';
}

export const FestiveDecorations: React.FC<FestiveDecorationsProps> = ({ variant = 'lobby' }) => {
  return (
    <DecorationsWrapper aria-hidden="true">
      {/* Decoración lateral izquierda: Guitarra con animación suave */}
      <FloatingLeft>
        <img src={guitarraImg} alt="" className="decor-guitarra" />
      </FloatingLeft>

      {/* Decoración lateral derecha: Sombrero o Calaverita según la vista */}
      <FloatingRight>
        {variant === 'login' ? (
          <img src={calaveritaImg} alt="" className="decor-calaverita" />
        ) : (
          <img src={sombreroImg} alt="" className="decor-sombrero" />
        )}
      </FloatingRight>
    </DecorationsWrapper>
  );
};

export default FestiveDecorations;

const floatLeft = keyframes`
  0% { transform: translateY(0) rotate(-14deg); }
  50% { transform: translateY(-10px) rotate(-11deg); }
  100% { transform: translateY(0) rotate(-14deg); }
`;

const floatRight = keyframes`
  0% { transform: translateY(0) rotate(12deg); }
  50% { transform: translateY(-8px) rotate(15deg); }
  100% { transform: translateY(0) rotate(12deg); }
`;

const DecorationsWrapper = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  user-select: none;
  z-index: 1;
  overflow: hidden;

  /* En dispositivos móviles se ocultan para mantener el foco en el contenido */
  @media (max-width: 880px) {
    display: none;
  }
`;

const FloatingLeft = styled.div`
  position: absolute;
  left: max(16px, calc((100vw - 900px) / 4));
  top: 38%;
  animation: ${floatLeft} 5s ease-in-out infinite;

  .decor-guitarra {
    width: clamp(100px, 12vw, 155px);
    height: auto;
    object-fit: contain;
    filter: drop-shadow(0 12px 20px rgba(70, 93, 107, 0.18));
    opacity: 0.9;
  }
`;

const FloatingRight = styled.div`
  position: absolute;
  right: max(16px, calc((100vw - 900px) / 4));
  top: 36%;
  animation: ${floatRight} 4.5s ease-in-out infinite;

  .decor-sombrero {
    width: clamp(110px, 13vw, 175px);
    height: auto;
    object-fit: contain;
    filter: drop-shadow(0 12px 20px rgba(70, 93, 107, 0.18));
    opacity: 0.92;
  }

  .decor-calaverita {
    width: clamp(85px, 10vw, 130px);
    height: auto;
    object-fit: contain;
    filter: drop-shadow(0 10px 18px rgba(70, 93, 107, 0.16));
    opacity: 0.95;
  }
`;

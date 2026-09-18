import React from 'react';
import styled from 'styled-components';
import nopalBottom from '../../assets/theme/nopal-bottom.png';

interface DesertLandscapeProps {
  className?: string;
}

export const DesertLandscape: React.FC<DesertLandscapeProps> = ({ className }) => {
  return (
    <LandscapeWrapper className={className} aria-hidden="true">
      <img
        src={nopalBottom}
        alt="Paisaje desértico mexicano"
        className="nopal-illustration"
      />
    </LandscapeWrapper>
  );
};

export default DesertLandscape;

const LandscapeWrapper = styled.footer`
  width: 100%;
  max-width: 100vw;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  pointer-events: none;
  user-select: none;
  position: relative;
  z-index: 1;
  margin-top: auto;
  padding: clamp(16px, 3vh, 32px) 16px 0;
  overflow: hidden;
  box-sizing: border-box;

  .nopal-illustration {
    width: 100%;
    max-width: min(100%, 880px);
    height: auto;
    max-height: clamp(110px, 18vh, 185px);
    object-fit: contain;
    object-position: bottom center;
    display: block;
    filter: drop-shadow(0 -4px 12px rgba(70, 93, 107, 0.09));
  }

  /* Suave base terrenal en armonía con la paleta */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(
      to top,
      rgba(200, 175, 135, 0.28) 0%,
      transparent 100%
    );
    pointer-events: none;
  }

  @media (max-width: 480px) {
    padding-top: 12px;

    .nopal-illustration {
      max-height: clamp(85px, 15vh, 125px);
    }
  }
`;

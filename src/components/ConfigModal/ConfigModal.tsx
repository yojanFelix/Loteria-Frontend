import { useState, useEffect } from 'react';
import styled from 'styled-components';
import frijolImg from '../../assets/theme/frijol.png';
import monedaPesoImg from '../../assets/theme/moneda-peso.png';
import moneda5PesoImg from '../../assets/theme/moneda-5peso.png';
import monedaCentavoImg from '../../assets/theme/moneda-centavo.png';
import tapaImg from '../../assets/theme/tapa.png';
import tapa2Img from '../../assets/theme/tapa2.png';
import piedritaImg from '../../assets/theme/piedrita.png';
import piedrita2Img from '../../assets/theme/piedrita2.png';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  padding: 16px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  padding: 24px;
  position: relative;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  max-height: 90vh;
  overflow-y: auto;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  &:hover { color: #000; }
`;

const Title = styled.h2`
  margin-top: 0;
  color: #1f2937;
  font-family: 'Poppins', sans-serif;
  text-align: center;
`;

const MarkerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 24px;
  margin-bottom: 24px;
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const MarkerOption = styled.label<{ selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 2px solid ${props => props.selected ? '#1a7f37' : '#e5e7eb'};
  border-radius: 8px;
  cursor: pointer;
  background-color: ${props => props.selected ? '#f0fdf4' : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    border-color: #1a7f37;
  }

  img {
    width: 50px;
    height: 50px;
    object-fit: contain;
    margin-bottom: 12px;
  }
  
  span {
    font-size: 13px;
    text-align: center;
  }
`;

const Checkbox = styled.input`
  margin-right: 6px;
  accent-color: #1a7f37;
`;

const OptionRow = styled.label`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #374151;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f3f4f6;
  }
  
  input {
    margin-right: 12px;
    transform: scale(1.2);
    accent-color: #1a7f37;
  }
`;

export const MARKER_OPTIONS = [
  { id: 'frijol', name: 'Frijolito', img: frijolImg },
  { id: 'moneda-peso', name: 'Moneda $1', img: monedaPesoImg },
  { id: 'moneda-5peso', name: 'Moneda $5', img: moneda5PesoImg },
  { id: 'moneda-centavo', name: 'Centavos', img: monedaCentavoImg },
  { id: 'tapa', name: 'Tapa Roja', img: tapaImg },
  { id: 'tapa2', name: 'Tapa Dorada', img: tapa2Img },
  { id: 'piedrita', name: 'Piedra Gris', img: piedritaImg },
  { id: 'piedrita2', name: 'Piedra Blanca', img: piedrita2Img }
];

export const getSelectedMarkers = (): string[] => {
  try {
    const saved = localStorage.getItem('selectedMarkers');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return ['frijol'];
};

export const getRandomRotation = (): boolean => {
  return localStorage.getItem('randomRotation') !== 'false';
};

interface ConfigModalProps {
  onClose: () => void;
}

export default function ConfigModal({ onClose }: ConfigModalProps) {
  const [selected, setSelected] = useState<string[]>(getSelectedMarkers());
  const [randomRotation, setRandomRotation] = useState<boolean>(getRandomRotation());

  const toggleMarker = (id: string) => {
    setSelected(prev => {
      const isSelected = prev.includes(id);
      if (isSelected && prev.length === 1) return prev; // Al menos uno
      const next = isSelected ? prev.filter(m => m !== id) : [...prev, id];
      return next;
    });
  };

  useEffect(() => {
    localStorage.setItem('selectedMarkers', JSON.stringify(selected));
    localStorage.setItem('randomRotation', String(randomRotation));
    // Disparamos un evento para que las demás vistas (ej. WaitingRoom) sepan del cambio
    window.dispatchEvent(new Event('markersChanged'));
  }, [selected, randomRotation]);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <Title>Configuración</Title>
        <p style={{ textAlign: 'center', color: '#4b5563', margin: 0 }}>
          Elige con qué quieres marcar tus cartas. Si eliges varios, se seleccionarán al azar.
        </p>

        <MarkerGrid>
          {MARKER_OPTIONS.map(marker => {
            const isSelected = selected.includes(marker.id);
            return (
              <MarkerOption key={marker.id} selected={isSelected}>
                <img src={marker.img} alt={marker.name} />
                <div style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                  <Checkbox 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={() => toggleMarker(marker.id)} 
                  />
                  <span>{marker.name}</span>
                </div>
              </MarkerOption>
            );
          })}
        </MarkerGrid>
        
        <OptionRow>
          <input 
            type="checkbox" 
            checked={randomRotation} 
            onChange={e => setRandomRotation(e.target.checked)}
          />
          Rotación aleatoria (Mayor realismo)
        </OptionRow>
      </ModalContent>
    </ModalOverlay>
  );
}

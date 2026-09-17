import React, { useState } from 'react';
import styled from 'styled-components';

interface CreateRoomModalProps {
  onClose: () => void;
  onCreate: (maxPlayers: number) => void;
}

const CreateRoomModal = ({ onClose, onCreate }: CreateRoomModalProps) => {
  const [maxPlayers, setMaxPlayers] = useState<number>(2);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    
    // Si el usuario borra el contenido, lo dejamos vacío temporalmente
    if (isNaN(value)) {
      setMaxPlayers("" as any);
      return;
    }
    
    // Evitamos que escriban más de 50 de forma manual
    if (value > 50) {
      setMaxPlayers(50);
    } else {
      setMaxPlayers(value);
    }
  };

  const handleBlur = () => {
    // Al quitar el foco del input, si está vacío o es menor a 2, lo forzamos a 2
    if (!maxPlayers || maxPlayers < 2) {
      setMaxPlayers(2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalValue = maxPlayers;
    
    if (!finalValue || finalValue < 2) finalValue = 2;
    if (finalValue > 50) finalValue = 50;
    
    onCreate(finalValue);
  };

  return (
    <StyledWrapper>
      <div className="overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <form className="form" onSubmit={handleSubmit}>
            
            <div className="header">
              <h2>Configurar Sala</h2>
              <button type="button" className="close-btn" onClick={onClose}>&times;</button>
            </div>

            <div className="separator">
              <hr className="line" />
            </div>

            <div className="room-config--form">
              <div className="input_container">
                <label htmlFor="max_players" className="input_label">MÁXIMO DE JUGADORES (2 - 50)</label>
                <input 
                  id="max_players" 
                  className="input_field" 
                  type="number" 
                  min="2" 
                  max="50" 
                  value={maxPlayers}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="2" 
                />
              </div>
            </div>

            <button type="submit" className="purchase--btn">Crear</button>
          </form>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  /* Fondo oscuro semi-transparente */
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .modal {
    width: 100%;
    height: fit-content;
    background: #FFFFFF;
    box-shadow: 0px 187px 75px rgba(0, 0, 0, 0.01), 0px 105px 63px rgba(0, 0, 0, 0.05), 0px 47px 47px rgba(0, 0, 0, 0.09), 0px 12px 26px rgba(0, 0, 0, 0.1), 0px 0px 0px rgba(0, 0, 0, 0.1);
    border-radius: 26px;
    max-width: 350px;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
  }

  .header h2 {
    margin: 0;
    font-size: 18px;
    color: #333;
  }

  .close-btn {
    background: transparent;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #8B8E98;
    transition: 0.2s;
  }

  .close-btn:hover {
    color: #333;
  }

  .separator {
    width: calc(100% - 20px);
    display: flex;
    margin: 0 10px;
  }

  .separator .line {
    display: inline-block;
    width: 100%;
    height: 1px;
    border: 0;
    background-color: #e8e8e8;
    margin: auto;
  }

  .room-config--form {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 0 10px;
  }

  .input_container {
    width: 100%;
    height: fit-content;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .input_label {
    font-size: 10px;
    color: #8B8E98;
    font-weight: 600;
  }

  .input_field {
    width: 100%;
    box-sizing: border-box;
    height: 40px;
    padding: 0 16px;
    border-radius: 9px;
    outline: none;
    background-color: #F2F2F2;
    border: 1px solid #e5e5e500;
    transition: all 0.3s cubic-bezier(0.15, 0.83, 0.66, 1);
    font-size: 16px;
    font-weight: bold;
    text-align: center;
  }

  .input_field:focus {
    border: 1px solid transparent;
    box-shadow: 0px 0px 0px 2px #242424;
    background-color: transparent;
  }

  .purchase--btn {
    height: 55px;
    background: #F2F2F2;
    border-radius: 11px;
    border: 0;
    outline: none;
    color: #ffffff;
    font-size: 13px;
    font-weight: 700;
    background: linear-gradient(180deg, #363636 0%, #1B1B1B 50%, #000000 100%);
    box-shadow: 0px 0px 0px 0px #FFFFFF, 0px 0px 0px 0px #000000;
    transition: all 0.3s cubic-bezier(0.15, 0.83, 0.66, 1);
    cursor: pointer;
    margin-top: 10px;
  }

  .purchase--btn:hover {
    box-shadow: 0px 0px 0px 2px #FFFFFF, 0px 0px 0px 4px #0000003a;
  }

  /* Reset input number styles */
  .input_field::-webkit-outer-spin-button,
  .input_field::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .input_field[type=number] {
    -moz-appearance: textfield;
  }
`;

export default CreateRoomModal;
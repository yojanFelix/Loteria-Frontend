import styled from 'styled-components';

// 1. Definimos la propiedad onClick
interface ButtonProps {
  onClick?: () => void;
}

// 2. Recibimos onClick como parámetro y lo pasamos al botón
const Button = ({ onClick }: ButtonProps) => {
  return (
    <StyledWrapper>
      <button className="Btn" onClick={onClick}>
        <div className="sign">+</div>
        <div className="text">Crear</div>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .Btn {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 45px;
    height: 45px;
    border-radius: 1rem;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition-duration: .3s;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.199);
    background-color: black;
  }

  /* plus sign */
  .sign {
    width: 100%;
    font-size: 2em;
    color: white;
    transition-duration: .3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  /* text */
  .text {
    position: absolute;
    right: 0%;
    width: 0%;
    opacity: 0;
    color: white;
    font-size: 1.2em;
    font-weight: 500;
    transition-duration: .3s;
  }
  /* hover effect on button width */
  .Btn:hover {
    width: 125px;
    border-radius: 0px;
    transition-duration: .3s;
  }

  .Btn:hover .sign {
    width: 30%;
    transition-duration: .3s;
    padding-left: 20px;
  }
  /* hover effect button's text */
  .Btn:hover .text {
    opacity: 1;
    width: 70%;
    transition-duration: .3s;
    padding-right: 20px;
  }
  /* button click effect*/
  .Btn:active {
    transform: translate(2px ,2px);
  }
`;

export default Button;
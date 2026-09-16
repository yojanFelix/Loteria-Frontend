import { useState } from 'react';
import styled from 'styled-components';

const Input = () => {
    const [valor, setValor] = useState('');

    const mayus = (e: React.ChangeEvent<HTMLInputElement>) => {
        let texto = e.target.value.toUpperCase().replace(/-/g, '')
        texto = texto.slice(0, 6);

        if (texto.length > 3){
            texto = texto.slice(0, 3) + '-' + texto.slice(3);
        }
        setValor(texto);
    }
  return (
    <StyledWrapper>
      <input 
      type="text" 
      name="text" 
      className="input" 
      placeholder="XXX-XXX" 
      maxLength={7}
      onChange={mayus}
      value={valor}
       />
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .input {
   border: none;
   padding: 1rem;
   border-radius: 1rem;
   background: #bebbbb;
   box-shadow: 20px 20px 60px #c5c5c5,
  		-20px -20px 60px #ffffff;
   transition: 0.3s;
  }

  .input:focus {
   outline-color: #e8e8e8;
   background: #e8e8e8;
   box-shadow: inset 20px 20px 60px #c5c5c5,
  		inset -20px -20px 60px #ffffff;
   transition: 0.3s;
  }`;

export default Input;

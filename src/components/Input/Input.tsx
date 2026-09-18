import styled from 'styled-components';

interface InputProps {
  value: string;
  onChange: (valor: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
}

const Input = ({ value, onChange, onSubmit, placeholder = 'XXX-XXX' }: InputProps) => {
  const mayus = (e: React.ChangeEvent<HTMLInputElement>) => {
    let texto = e.target.value.toUpperCase().replace(/-/g, '')
    texto = texto.slice(0, 6);

    if (texto.length > 3) {
      texto = texto.slice(0, 3) + '-' + texto.slice(3);
    }
    onChange(texto);
  }

  const manejarTecla = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.length === 7) {
      onSubmit?.();
    }
  }

  return (
    <StyledWrapper>
      <input
        type="text"
        name="text"
        className="input"
        placeholder={placeholder}
        maxLength={7}
        onChange={mayus}
        onKeyDown={manejarTecla}
        value={value}
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

import { useState } from 'react'
import styled from 'styled-components'

interface LogInProps {
  onLoginExitoso: () => void;
}

const Form = ({ onLoginExitoso }: LogInProps) => {
  const [accountNumber, setAccountNumber] = useState('')
  const [guestName, setGuestName] = useState('')
  const [isGuest, setIsGuest] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      const endpoint = isGuest ? '/api/users/guest' : '/api/users/login'
      const body = isGuest ? { name: guestName } : { accountNumber }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        setError(data.message || (isGuest ? 'Error al crear invitado' : 'Número de cuenta inválido'))
        setCargando(false)
        return
      }

      const returnedAccount = data.data?.user?.accountNumber || accountNumber
      localStorage.setItem('accountNumber', returnedAccount)
      localStorage.setItem('token', data.data?.token ?? '')
      
      if (data.data?.user?.name) {
        localStorage.setItem('userName', data.data.user.name)
      }
      
      onLoginExitoso()
    } catch {
      setError('No se pudo conectar con el servidor')
    } finally {
      setCargando(false)
    }
  }

  return (
    <StyledWrapper>
      <div className="form-container">
        <h2 className="titulo-login">
          {isGuest ? 'Entrar como Invitado' : 'Ingresa tu número de cuenta'}
        </h2>
        
        <div className="tabs">
          <button 
            type="button" 
            className={`tab ${!isGuest ? 'active' : ''}`}
            onClick={() => { setIsGuest(false); setError(''); }}
          >
            Cuenta
          </button>
          <button 
            type="button" 
            className={`tab ${isGuest ? 'active' : ''}`}
            onClick={() => { setIsGuest(true); setError(''); }}
          >
            Invitado
          </button>
        </div>

        <form className="form" onSubmit={manejarSubmit}>
          <div className="form-group">
            {isGuest ? (
              <input
                required
                placeholder="Tu apodo (ej. El Macho)"
                name="guestName"
                id="guestName"
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                autoFocus
              />
            ) : (
              <input
                required
                placeholder="Ej. 20230001"
                name="accountNumber"
                id="accountNumber"
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                autoFocus
              />
            )}
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="form-submit-btn" disabled={cargando}>
            {cargando ? 'Verificando...' : 'Ingresar a jugar'}
          </button>
        </form>

      </div>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 10px 16px;

  .form-container {
    width: 100%;
    max-width: 420px;
    background-color: #ffffff;
    padding: 36px 28px;
    display: flex;
    flex-direction: column;
    gap: 22px;
    border-radius: 18px;
    border: 2px solid var(--color-blue, #81AEB7);
    box-shadow: 0 8px 24px rgba(70, 93, 107, 0.12);
  }

  .titulo-login {
    font-family: var(--font-theme);
    color: var(--color-dark, #465D6B);
    text-align: center;
    font-size: clamp(20px, 4.5vw, 26px);
    margin: 0;
    line-height: 1.3;
  }

  .tabs {
    display: flex;
    gap: 8px;
    background: rgba(129, 174, 183, 0.15);
    padding: 6px;
    border-radius: 12px;
  }

  .tab {
    flex: 1;
    padding: 10px;
    border: none;
    background: transparent;
    border-radius: 8px;
    font-family: var(--font-sans);
    font-weight: 600;
    font-size: 15px;
    color: rgba(70, 93, 107, 0.6);
    cursor: pointer;
    transition: all 0.2s;

    &.active {
      background: white;
      color: var(--color-dark, #465D6B);
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-group input {
    width: 100%;
    height: 54px;
    padding: 0 16px;
    border-radius: 12px;
    font-family: var(--font-sans);
    font-size: 18px;
    font-weight: 600;
    text-align: center;
    letter-spacing: 1px;
    border: 1.5px solid rgba(70, 93, 107, 0.3);
    color: var(--color-dark, #465D6B);
    background-color: #fffef8;
    transition: all 0.2s ease;

    &::placeholder {
      font-weight: 400;
      color: rgba(70, 93, 107, 0.45);
    }

    &:focus {
      outline: none;
      border-color: var(--color-red, #D8575D);
      box-shadow: 0 0 0 3px rgba(216, 87, 93, 0.2);
    }
  }

  .error-message {
    color: var(--color-red, #D8575D);
    font-weight: 600;
    font-size: 14px;
    margin: 0;
    text-align: center;
    background-color: rgba(216, 87, 93, 0.08);
    padding: 8px 12px;
    border-radius: 8px;
  }

  .separador-invitado {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #8B8E98;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .separador-invitado::before,
  .separador-invitado::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e8e8e8;
  }

  .link-invitado {
    background: transparent;
    border: none;
    color: var(--color-blue, #81AEB7);
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
    padding: 4px;
  }

  .link-invitado:hover {
    color: var(--color-dark, #465D6B);
  }

  .btn-invitado {
    background-color: var(--color-blue, #81AEB7);
  }

  .form-invitado {
    margin-top: -6px;
  }

  .form-submit-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 54px;
    font-family: var(--font-theme);
    font-size: clamp(17px, 4vw, 20px);
    color: #ffffff;
    background-color: var(--color-red, #D8575D);
    border: none;
    border-radius: 14px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(216, 87, 93, 0.35);
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      filter: brightness(1.05);
      box-shadow: 0 6px 16px rgba(216, 87, 93, 0.45);
    }

    &:active {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  }
`

export default Form

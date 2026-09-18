import { useState } from 'react'
import styled from 'styled-components'

interface LogInProps {
  onLoginSuccess: (accountNumber: string) => void
}

const Form = ({ onLoginSuccess }: LogInProps) => {
  const [accountNumber, setAccountNumber] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      const response = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountNumber }),
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        setError(data.message || 'Número de cuenta inválido')
        setCargando(false)
        return
      }

      // Login exitoso
      localStorage.setItem('accountNumber', accountNumber)
      console.log('Login exitoso:', data)
      onLoginSuccess(accountNumber)
      // Aquí podrías guardar el token/usuario y redirigir, ej:
      // localStorage.setItem('usuario', JSON.stringify(data.usuario))
      // navigate('/tablero')

    } catch (err) {
      setError('No se pudo conectar con el servidor')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  return (
    <StyledWrapper>
      <div className="form-container">
        <div className="logo-container">Ingresa tu numero de cuenta</div>
        <form className="form" onSubmit={manejarSubmit}>
          <div className="form-group">
            <input
              required
              placeholder="12345678"
              name="accountNumber"
              id="accountNumber"
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="form-submit-btn" disabled={cargando}>
            {cargando ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  .form-container {
    max-width: 400px;
    background-color: #fff;
    padding: 32px 24px;
    font-size: 14px;
    font-family: inherit;
    color: #212121;
    display: flex;
    flex-direction: column;
    gap: 20px;
    box-sizing: border-box;
    border-radius: 10px;
    box-shadow:
      0px 0px 3px rgba(0, 0, 0, 0.084),
      0px 2px 3px rgba(0, 0, 0, 0.168);
  }

  .form-container button:active {
    scale: 0.95;
  }

  .form-container .logo-container {
    text-align: center;
    font-weight: 600;
    font-size: 18px;
  }

  .form-container .form {
    display: flex;
    flex-direction: column;
  }

  .form-container .form-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .form-container .form-group input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 6px;
    font-family: inherit;
    border: 1px solid #141414;
  }

  .form-container .form-group input::placeholder {
    opacity: 0.5;
  }

  .form-container .form-group input:focus {
    outline: none;
    border-color: #1778f2;
  }

  .error-message {
    color: #e0245e;
    font-size: 13px;
    margin: 0;
    text-align: center;
  }

  .form-container .form-submit-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: inherit;
    color: #fff;
    background-color: #212121;
    border: none;
    width: 100%;
    padding: 12px 16px;
    font-size: inherit;
    gap: 8px;
    margin: 12px 0;
    cursor: pointer;
    border-radius: 6px;
    box-shadow:
      0px 0px 3px rgba(0, 0, 0, 0.084),
      0px 2px 3px rgba(0, 0, 0, 0.168);
  }

  .form-container .form-submit-btn:hover {
    background-color: #313131;
  }

  .form-container .form-submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export default Form
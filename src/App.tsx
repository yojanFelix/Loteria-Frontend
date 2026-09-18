import { useState, useEffect } from 'react'
import './App.css'
import PapelPicado from './components/PapelPicado/PapelPicado'
import DesertLandscape from './components/DesertLandscape/DesertLandscape'
import FestiveDecorations from './components/FestiveDecorations/FestiveDecorations'
import maracasImg from './assets/theme/maracas.png'
import sombreroImg from './assets/theme/sombrero.png'
import LogIn from './components/Board/LogIn'
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home/Home'
import WaitingRoom from './pages/WaitingRoom/WaitingRoom'
import SalasModal from './components/SalasModal/SalasModal'
import RankingModal from './components/RankingModal/RankingModal'
import ReglasModal from './components/ReglasModal/ReglasModal'
import ConfirmModal from './components/ConfirmModal/ConfirmModal'
import PerfilModal from './components/PerfilModal/PerfilModal'
import {
  abandonarSala,
  conectarSocket,
  desconectarSocket,
  unirseSala,
  type DatosSala,
  type ModoJuego,
} from './socket/socket'

type Vista = 'login' | 'home' | 'espera'

interface ActiveRoomCache {
  sala: DatosSala
  modo: ModoJuego | null
  alias?: string
}

function App() {
  // Inicializar autenticado si ya existe token en el caché local
  const [autenticado, setAutenticado] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('token') && localStorage.getItem('accountNumber'))
  })

  // Código pendiente de unirse recibido vía URL o QR (?join=XXX-XXX)
  const [pendingJoinCode, setPendingJoinCode] = useState<string | null>(() => {
    const urlCode = new URLSearchParams(window.location.search).get('join')
    if (urlCode) {
      sessionStorage.setItem('pendingJoinCode', urlCode)
      return urlCode
    }
    return sessionStorage.getItem('pendingJoinCode')
  })

  const [vista, setVista] = useState<Vista>(() => {
    const hasRoom = Boolean(localStorage.getItem('activeRoom'))
    return hasRoom ? 'espera' : 'home'
  })

  const [modalActivo, setModalActivo] = useState<'salas' | 'ranking' | 'reglas' | 'perfil' | null>(null)
  const [mostrarConfirmacionSalir, setMostrarConfirmacionSalir] = useState(false)

  const [sala, setSala] = useState<{ sala: DatosSala; modo: ModoJuego | null } | null>(() => {
    try {
      const cached = localStorage.getItem('activeRoom')
      if (cached) {
        const parsed: ActiveRoomCache = JSON.parse(cached)
        return { sala: parsed.sala, modo: parsed.modo }
      }
    } catch {
      localStorage.removeItem('activeRoom')
    }
    return null
  })

  // Reconexión automática al refrescar la página
  useEffect(() => {
    const token = localStorage.getItem('token')
    const accountNumber = localStorage.getItem('accountNumber')

    if (token && accountNumber) {
      conectarSocket()

      const cachedRoomStr = localStorage.getItem('activeRoom')
      if (cachedRoomStr) {
        try {
          const parsed: ActiveRoomCache = JSON.parse(cachedRoomStr)
          const alias = parsed.alias || localStorage.getItem('userName') || accountNumber

          // Reconectar a la sala previa en el backend para re-suscribir el socket
          unirseSala(parsed.sala.code, alias)
            .then((salaActualizada) => {
              setSala({ sala: salaActualizada, modo: parsed.modo })
              setVista('espera')
            })
            .catch((err) => {
              console.warn('La sala previa ya no está disponible:', err)
              localStorage.removeItem('activeRoom')
              setSala(null)
              setVista('home')
            })
        } catch {
          localStorage.removeItem('activeRoom')
        }
      }
    }
  }, [])

  const handleLogout = async () => {
    const accountNumber = localStorage.getItem('accountNumber')

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/users/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber }),
      })
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error)
    }

    localStorage.removeItem('accountNumber')
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('activeRoom')
    sessionStorage.removeItem('pendingJoinCode')
    desconectarSocket()
    setSala(null)
    setVista('home')
    setAutenticado(false)
  }

  const handleLoginExitoso = () => {
    conectarSocket()
    const pending = sessionStorage.getItem('pendingJoinCode')
    if (pending) {
      setPendingJoinCode(pending)
    }
    setVista('home')
    setAutenticado(true)
  }

  const ingresarSala = (datos: DatosSala, modo: ModoJuego | null) => {
    const aliasGuardar = localStorage.getItem('userName') || ''
    const roomCache: ActiveRoomCache = { sala: datos, modo, alias: aliasGuardar }
    try {
      localStorage.setItem('activeRoom', JSON.stringify(roomCache))
    } catch {
      // Ignorar fallo de cuota en storage
    }
    setSala({ sala: datos, modo })
    setVista('espera')
    sessionStorage.removeItem('pendingJoinCode')
    setPendingJoinCode(null)
  }

  const salirDeSala = () => {
    localStorage.removeItem('activeRoom')
    setSala(null)
    setVista('home')
  }

  const handleUnirseDesdeSalasModal = async (codigo: string) => {
    const token = localStorage.getItem('token')
    let alias = localStorage.getItem('userName') || ''
    const accountNumber = localStorage.getItem('accountNumber') || ''

    if (!alias && token && accountNumber) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${accountNumber}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data?.ok && data?.data?.name) {
          alias = data.data.name
          localStorage.setItem('userName', alias)
        }
      } catch {
        // Fallback al número de cuenta
      }
    }

    const aliasFinal = alias.trim() || accountNumber || 'Jugador'
    const salaRetornada = await unirseSala(codigo, aliasFinal)
    ingresarSala(salaRetornada, null)
    setModalActivo(null)
  }

  const handleClicLogo = () => {
    if (vista === 'espera' && sala) {
      setMostrarConfirmacionSalir(true)
    } else {
      setModalActivo(null)
      setVista('home')
    }
  }

  if (autenticado) {
    return (
      <div className="app-background">
        <Navbar
          onLogout={handleLogout}
          onAbrirSeccion={(sec) => setModalActivo(sec)}
          onIrAlMenu={handleClicLogo}
        />
        {vista === 'espera' && sala ? (
          <WaitingRoom
            code={sala.sala.code}
            maxPlayers={sala.sala.maxPlayers}
            hostAccountNumber={sala.sala.hostAccountNumber}
            modo={sala.modo}
            onSalir={salirDeSala}
          />
        ) : (
          <Home
            onIngresarSala={ingresarSala}
            initialJoinCode={pendingJoinCode}
            salaActiva={sala}
            onVolverAPartida={() => setVista('espera')}
            onAbandonarSalaActiva={() => {
              if (sala) {
                abandonarSala(sala.sala.code).catch(console.error)
              }
              salirDeSala()
            }}
          />
        )}

        <ConfirmModal
          isOpen={mostrarConfirmacionSalir}
          onClose={() => setMostrarConfirmacionSalir(false)}
          onIrAlMenu={() => {
            setMostrarConfirmacionSalir(false)
            setVista('home')
          }}
          onAbandonarSala={() => {
            if (sala) {
              abandonarSala(sala.sala.code).catch(console.error)
            }
            salirDeSala()
            setMostrarConfirmacionSalir(false)
          }}
        />

        <SalasModal
          isOpen={modalActivo === 'salas'}
          onClose={() => setModalActivo(null)}
          onUnirse={handleUnirseDesdeSalasModal}
        />

        <RankingModal
          isOpen={modalActivo === 'ranking'}
          onClose={() => setModalActivo(null)}
        />

        <ReglasModal
          isOpen={modalActivo === 'reglas'}
          onClose={() => setModalActivo(null)}
        />
        
        <PerfilModal
          isOpen={modalActivo === 'perfil'}
          onClose={() => setModalActivo(null)}
        />
      </div>
    )
  }

  return (
    <div className="app-background login-page">
      <PapelPicado />
      <FestiveDecorations variant="login" />

      <div className="login-header">
        <h1 className="login-titulo">Lotería Mexicana</h1>
        <div className="vignette-emblema">
          <img src={sombreroImg} alt="" className="vignette-sombrero" />
          <img src={maracasImg} alt="Maracas mexicanas" className="login-maracas" />
        </div>
      </div>

      <div className="content-wrapper">
        <LogIn onLoginExitoso={handleLoginExitoso} />
      </div>

      <DesertLandscape />
    </div>
  )
}

export default App

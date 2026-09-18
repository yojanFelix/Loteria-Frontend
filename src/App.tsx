import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import PapelPicado from './components/PapelPicado/PapelPicado';
import DesertLandscape from './components/DesertLandscape/DesertLandscape';
import FestiveDecorations from './components/FestiveDecorations/FestiveDecorations';
import maracasImg from './assets/theme/maracas.png';
import sombreroImg from './assets/theme/sombrero.png';
import LogIn from './components/Board/LogIn';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import RoomPage from './pages/RoomPage/RoomPage';
import SalasModal from './components/SalasModal/SalasModal';
import RankingModal from './components/RankingModal/RankingModal';
import ReglasModal from './components/ReglasModal/ReglasModal';
import ConfirmModal from './components/ConfirmModal/ConfirmModal';
import PerfilModal from './components/PerfilModal/PerfilModal';
import ConfigModal from './components/ConfigModal/ConfigModal';
import { usePreloadDeck } from './hooks/usePreloadDeck';
import {
  abandonarSala,
  conectarSocket,
  desconectarSocket,
} from './socket/socket';

function App() {
  usePreloadDeck();

  const [autenticado, setAutenticado] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('token') && localStorage.getItem('accountNumber'));
  });

  const [modalActivo, setModalActivo] = useState<'salas' | 'ranking' | 'reglas' | 'perfil' | 'config' | null>(null);
  const [mostrarConfirmacionSalir, setMostrarConfirmacionSalir] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (autenticado) {
      conectarSocket();
    }
  }, [autenticado]);

  const handleLogout = async () => {
    const accountNumber = localStorage.getItem('accountNumber');

    try {
      await fetch('http://localhost:3000/api/users/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber }),
      });
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error);
    }

    localStorage.removeItem('accountNumber');
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    desconectarSocket();
    setAutenticado(false);
    navigate('/');
  };

  const handleLoginExitoso = () => {
    conectarSocket();
    setAutenticado(true);
    
    // Si tenían un código pendiente en la URL, redirigirlos ahí
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join') || sessionStorage.getItem('pendingJoinCode');
    
    if (joinCode) {
      sessionStorage.removeItem('pendingJoinCode');
      navigate(`/room/${joinCode}`);
    } else {
      navigate('/');
    }
  };

  const handleClicLogo = () => {
    if (location.pathname.startsWith('/room/')) {
      setMostrarConfirmacionSalir(true);
    } else {
      setModalActivo(null);
      navigate('/');
    }
  };

  const handleAbandonarSala = async () => {
    const codeMatch = location.pathname.match(/\/room\/([A-Za-z0-9-]+)/);
    if (codeMatch && codeMatch[1]) {
      try {
        await abandonarSala(codeMatch[1]);
      } catch (err) {
        console.error('Error al abandonar:', err);
      }
    }
    setMostrarConfirmacionSalir(false);
    navigate('/');
  };

  if (!autenticado) {
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
    );
  }

  return (
    <div className="app-background">
      <Navbar
        onLogout={handleLogout}
        onAbrirSeccion={(sec) => setModalActivo(sec)}
        onIrAlMenu={handleClicLogo}
      />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ConfirmModal
        isOpen={mostrarConfirmacionSalir}
        onClose={() => setMostrarConfirmacionSalir(false)}
        onIrAlMenu={() => {
          setMostrarConfirmacionSalir(false);
          navigate('/');
        }}
        onAbandonarSala={handleAbandonarSala}
      />

      <SalasModal
        isOpen={modalActivo === 'salas'}
        onClose={() => setModalActivo(null)}
        onUnirse={(code) => {
          setModalActivo(null);
          navigate(`/room/${code}`);
        }}
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
      
      {modalActivo === 'config' && (
        <ConfigModal onClose={() => setModalActivo(null)} />
      )}
    </div>
  );
}

export default App;

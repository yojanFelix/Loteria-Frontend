import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { crearSala, unirseSala, type ModoJuego } from '../../socket/socket';
import PapelPicado from '../../components/PapelPicado/PapelPicado';
import DesertLandscape from '../../components/DesertLandscape/DesertLandscape';
import FestiveDecorations from '../../components/FestiveDecorations/FestiveDecorations';
import maracasImg from '../../assets/theme/maracas.png';
import sombreroImg from '../../assets/theme/sombrero.png';
import checkmarkImg from '../../assets/theme/checkmark.png';
import { ArrowLeftIcon } from '../../components/Icons/Icons';



type VistaHome = 'menu' | 'unirse' | 'crear';

type PatronVisual = 'CHORRO' | 'EQUIS' | 'CENTRO' | 'ESQUINAS' | 'ESCUADRA' | 'DIAGONAL' | 'CUADRITO' | 'LLENA';

interface PatronInfo {
  id: PatronVisual;
  nombre: string;
  modoBackend: ModoJuego;
  casillas: number[];
}

const PATRONES: PatronInfo[] = [
  {
    id: 'CHORRO',
    nombre: 'Chorro',
    modoBackend: 'LINE',
    casillas: [1, 5, 9, 13],
  },
  {
    id: 'EQUIS',
    nombre: 'Equis',
    modoBackend: 'LINE',
    casillas: [0, 3, 5, 6, 9, 10, 12, 15],
  },
  {
    id: 'CENTRO',
    nombre: 'Centro',
    modoBackend: 'CENTER_2X2',
    casillas: [5, 6, 9, 10],
  },
  {
    id: 'ESQUINAS',
    nombre: '4 Esquinas',
    modoBackend: 'CORNERS',
    casillas: [0, 3, 12, 15],
  },
  {
    id: 'ESCUADRA',
    nombre: 'Escuadra',
    modoBackend: 'LINE',
    casillas: [0, 4, 8, 12, 13, 14, 15],
  },
  {
    id: 'DIAGONAL',
    nombre: 'Diagonal',
    modoBackend: 'LINE',
    casillas: [0, 5, 10, 15],
  },
  {
    id: 'CUADRITO',
    nombre: '2x2',
    modoBackend: 'SQUARE_2X2',
    casillas: [0, 1, 4, 5],
  },
  {
    id: 'LLENA',
    nombre: 'Llena',
    modoBackend: 'FULL_BOARD',
    casillas: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  },
];

const TEXTO_VALIDO = /^[\p{L}\p{N} _\-()]+$/u;

// Esta pantalla no pide límite de jugadores, así que se crea con el tope alto.
const MAX_JUGADORES = 100;

function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [vista, setVista] = useState<VistaHome>('menu');

  // Estado para "Unirse"
  const [codigo, setCodigo] = useState('');
  const [aliasUnirse, setAliasUnirse] = useState('');

  // Estado para "Crear"
  const [nombreSala, setNombreSala] = useState('');
  const [aliasCrear, setAliasCrear] = useState('');
  const [patronesSeleccionados, setPatronesSeleccionados] = useState<PatronVisual[]>([]);

  // Si viene con un código de sala desde URL o QR, abrir vista "unirse" con el código
  useEffect(() => {
    const codeToJoin = searchParams.get('join');
    if (codeToJoin) {
      let raw = codeToJoin.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      if (raw.length > 3) {
        raw = `${raw.slice(0, 3)}-${raw.slice(3)}`;
      }
      setCodigo(raw);
      setVista('unirse');
    }
  }, [searchParams]);

  // Pre-llenar alias con el nombre del usuario desde la BD / localStorage
  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setAliasCrear(storedName);
      setAliasUnirse(storedName);
    } else {
      const token = localStorage.getItem('token');
      if (token) {
        fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.ok && data?.data?.name) {
              localStorage.setItem('userName', data.data.name);
              setAliasCrear(data.data.name);
              setAliasUnirse(data.data.name);
            }
          })
          .catch((err) => {
            console.error('Error al obtener usuario actual:', err);
          });
      }
    }
  }, []);

  const togglePatron = (id: PatronVisual) => {
    setError('');
    setPatronesSeleccionados((prev) => {
      if (prev.includes(id)) {
        return prev.filter((p) => p !== id);
      }
      return [...prev, id];
    });
  };

  // Estados generales
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Da formato XXX-XXX mientras se escribe, igual que el código que llega por QR.
  const handleCodigoChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError('');
    let raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (raw.length > 3) {
      raw = `${raw.slice(0, 3)}-${raw.slice(3)}`;
    }
    setCodigo(raw);
  };

  const handleUnirse = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanCode = codigo.trim().toUpperCase();
    if (cleanCode.length !== 7) {
      setError('El código debe tener el formato XXX-XXX');
      return;
    }

    const cleanAlias = aliasUnirse.trim();
    if (cleanAlias.length < 3 || cleanAlias.length > 45) {
      setError('El alias debe tener entre 3 y 45 caracteres');
      return;
    }
    if (!TEXTO_VALIDO.test(cleanAlias)) {
      setError('El alias solo puede tener letras, números, espacios, guiones y paréntesis');
      return;
    }

    setCargando(true);
    try {
      const sala = await unirseSala(cleanCode, cleanAlias);
      navigate(`/room/${sala.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo unir a la sala');
    } finally {
      setCargando(false);
    }
  };

  const handleCrear = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanNombre = nombreSala.trim() || 'Sala Mexicana';
    if (cleanNombre.length < 3 || cleanNombre.length > 45) {
      setError('El nombre de la sala debe tener entre 3 y 45 caracteres');
      return;
    }
    if (!TEXTO_VALIDO.test(cleanNombre)) {
      setError('El nombre solo puede tener letras, números, espacios, guiones y paréntesis');
      return;
    }

    const cleanAlias = aliasCrear.trim();
    if (cleanAlias.length < 3 || cleanAlias.length > 45) {
      setError('Tu alias debe tener entre 3 y 45 caracteres');
      return;
    }
    if (!TEXTO_VALIDO.test(cleanAlias)) {
      setError('El alias solo puede tener letras, números, espacios, guiones y paréntesis');
      return;
    }

    // Cada patrón visual se traduce al modo que entiende el backend, sin repetir.
    // Si no se elige ninguno, el backend juega con tabla llena.
    const modos = [
      ...new Set(
        patronesSeleccionados
          .map((id) => PATRONES.find((patron) => patron.id === id)?.modoBackend)
          .filter((modo): modo is ModoJuego => Boolean(modo)),
      ),
    ];

    setCargando(true);
    try {
      const sala = await crearSala(cleanNombre, MAX_JUGADORES, cleanAlias, modos);
      navigate(`/room/${sala.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la sala');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container>
      {/* Cenefa superior festiva de papel picado */}
      <PapelPicado />
      <FestiveDecorations variant="lobby" />

      {/* VISTA 1: MENÚ PRINCIPAL (IMAGEN 2) */}
      {vista === 'menu' && (
        <MenuContent>
          <TituloPrincipal>Lotería Mexicana</TituloPrincipal>

          <IlustracionWrapper>
            <div className="vignette-emblema">
              <img src={sombreroImg} alt="" className="vignette-sombrero" />
              <img src={maracasImg} alt="Maracas mexicanas" className="maracas-img" />
            </div>
          </IlustracionWrapper>

          <MenuBotones>
            <BotonRojo onClick={() => { setError(''); setVista('unirse'); }}>
              Unirse a una sala
            </BotonRojo>

            <BotonAzul onClick={() => { setError(''); setVista('crear'); }}>
              Crear una sala
            </BotonAzul>
          </MenuBotones>
        </MenuContent>
      )}

      {/* VISTA 2: UNIRSE A UNA SALA (IMAGEN 3) */}
      {vista === 'unirse' && (
        <FormContent onSubmit={handleUnirse}>
          <BotonVolver type="button" onClick={() => { setError(''); setVista('menu'); }}>
            <ArrowLeftIcon size={16} />
            <span>Volver al menú</span>
          </BotonVolver>

          <TituloSeccion>
            Ingresa el código de<br />la sala:
          </TituloSeccion>

          <CamposWrapper>
            <InputCodigo
              type="text"
              placeholder="000-000"
              maxLength={7}
              value={codigo}
              onChange={handleCodigoChange}
              autoFocus
            />

            <InputAlias
              type="text"
              placeholder="Tu alias o nombre"
              maxLength={45}
              value={aliasUnirse}
              onChange={(e) => setAliasUnirse(e.target.value)}
              disabled
            />
          </CamposWrapper>

          {error && <MensajeError>{error}</MensajeError>}

          <BotonRojo type="submit" disabled={cargando}>
            {cargando ? 'Entrando...' : 'Unirse'}
          </BotonRojo>
        </FormContent>
      )}

      {/* VISTA 3: CREAR UNA SALA (IMAGEN 4) */}
      {vista === 'crear' && (
        <CrearContent onSubmit={handleCrear}>
          <BotonVolver type="button" onClick={() => { setError(''); setVista('menu'); }}>
            <ArrowLeftIcon size={16} />
            <span>Volver al menú</span>
          </BotonVolver>

          <TituloSeccion>Crear una sala</TituloSeccion>

          <CamposCrearRow>
            <InputPequeno
              type="text"
              placeholder="Nombre de la sala (opcional)"
              maxLength={45}
              value={nombreSala}
              onChange={(e) => setNombreSala(e.target.value)}
            />
            <InputPequeno
              type="text"
              placeholder="Tu alias o nombre"
              maxLength={45}
              value={aliasCrear}
              onChange={(e) => setAliasCrear(e.target.value)}
              required
              disabled
            />
          </CamposCrearRow>

          <SubtituloLlamadas>Patrones con premio:</SubtituloLlamadas>
          <TextoAyudaPatrones>Selecciona las combinaciones ganadoras</TextoAyudaPatrones>

          {/* Grilla de los 8 patrones visuales de victoria */}
          <GrillaPatrones>
            {PATRONES.map((patron) => {
              const seleccionado = patronesSeleccionados.includes(patron.id);
              return (
                <TarjetaPatron
                  key={patron.id}
                  type="button"
                  onClick={() => togglePatron(patron.id)}
                  aria-pressed={seleccionado}
                >
                  <MiniCuadricula>
                    {Array.from({ length: 16 }).map((_, i) => (
                      <Celda key={i}>
                        {patron.casillas.includes(i) && <FichaCirculo />}
                      </Celda>
                    ))}
                    {seleccionado && (
                      <CheckPincelada>
                        <img src={checkmarkImg} alt="Seleccionado" />
                      </CheckPincelada>
                    )}
                  </MiniCuadricula>
                  <NombrePatron>
                    {patron.nombre}
                  </NombrePatron>
                </TarjetaPatron>
              );
            })}
          </GrillaPatrones>

          {error && <MensajeError>{error}</MensajeError>}

          <BotonCrearFinal type="submit" disabled={cargando}>
            {cargando ? 'Creando sala...' : 'Crear'}
          </BotonCrearFinal>
        </CrearContent>
      )}

      {/* Paisaje desértico en la parte inferior */}
      <DesertLandscape />
    </Container>
  );
}

// --- ESTILOS RESPONSIVOS Y TEMÁTICOS (Styled Components) ---

const Container = styled.div`
  width: 100%;
  min-height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: 0 16px 0;
  overflow-x: hidden;
  box-sizing: border-box;
`;

const BotonVolver = styled.button`
  align-self: flex-start;
  background: transparent;
  border: none;
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 600;
  color: var(--color-dark);
  cursor: pointer;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(70, 93, 107, 0.08);
  }
`;

// --- VISTA 1: MENU ---
const MenuContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 480px;
  margin-top: 10px;
  animation: fadeIn 0.3s ease;
  position: relative;
  z-index: 2;
`;

const TituloPrincipal = styled.h1`
  font-family: var(--font-theme);
  color: var(--color-dark);
  font-size: clamp(32px, 7vw, 48px);
  text-align: center;
  margin: 10px 0 16px;
  letter-spacing: 0.5px;
`;

const IlustracionWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 0 32px;

  .vignette-emblema {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-width: 240px;
    height: clamp(85px, 20vw, 120px);
    cursor: pointer;
  }

  .vignette-sombrero {
    position: absolute;
    width: clamp(95px, 22vw, 145px);
    height: auto;
    object-fit: contain;
    transform: translate(-20px, -12px) rotate(-14deg);
    opacity: 0.95;
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.14));
    transition: transform 0.3s ease;
  }

  .maracas-img {
    position: relative;
    z-index: 2;
    width: clamp(85px, 20vw, 125px);
    height: auto;
    object-fit: contain;
    transform: translate(16px, 6px) rotate(6deg);
    filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.15));
    transition: transform 0.3s ease;
  }

  .vignette-emblema:hover .maracas-img {
    transform: translate(16px, 2px) rotate(14deg) scale(1.06);
  }

  .vignette-emblema:hover .vignette-sombrero {
    transform: translate(-22px, -16px) rotate(-18deg) scale(1.05);
  }
`;

const MenuBotones = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  align-items: center;
`;

const BotonBase = styled.button`
  width: 100%;
  max-width: 380px;
  min-height: 58px;
  border: none;
  border-radius: 16px;
  font-family: var(--font-theme);
  font-size: clamp(19px, 4.5vw, 24px);
  color: #ffffff;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12);

  &:hover {
    transform: translateY(-3px) scale(1.015);
    filter: brightness(1.06);
  }

  &:active {
    transform: translateY(0) scale(0.99);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const BotonRojo = styled(BotonBase)`
  background-color: var(--color-red);
  box-shadow: 0 5px 15px rgba(216, 87, 93, 0.35);

  &:hover {
    box-shadow: 0 7px 20px rgba(216, 87, 93, 0.45);
  }
`;

const BotonAzul = styled(BotonBase)`
  background-color: var(--color-blue);
  box-shadow: 0 5px 15px rgba(129, 174, 183, 0.35);

  &:hover {
    box-shadow: 0 7px 20px rgba(129, 174, 183, 0.45);
  }
`;

// --- VISTA 2: UNIRSE ---
const FormContent = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 440px;
  margin-top: 10px;
  animation: fadeIn 0.3s ease;
  position: relative;
  z-index: 2;
`;

const TituloSeccion = styled.h2`
  font-family: var(--font-theme);
  color: var(--color-dark);
  font-size: clamp(24px, 5.5vw, 36px);
  text-align: center;
  line-height: 1.3;
  margin: 10px 0 24px;
`;

const CamposWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  margin-bottom: 24px;
`;

const InputCodigo = styled.input`
  width: 100%;
  height: 60px;
  background-color: #fffef8;
  border: 1.5px solid var(--color-blue);
  border-radius: 12px;
  font-family: var(--font-sans);
  font-size: 24px;
  font-weight: 700;
  color: var(--color-dark);
  text-align: center;
  letter-spacing: 4px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &::placeholder {
    color: rgba(70, 93, 107, 0.4);
    letter-spacing: 3px;
  }

  &:focus {
    outline: none;
    border-color: var(--color-red);
    box-shadow: 0 0 0 3px rgba(216, 87, 93, 0.2);
  }
`;

const InputAlias = styled.input`
  width: 100%;
  height: 52px;
  background-color: #fffef8;
  border: 1.5px solid rgba(70, 93, 107, 0.25);
  border-radius: 12px;
  font-family: var(--font-sans);
  font-size: 16px;
  color: var(--color-dark);
  text-align: center;
  transition: all 0.2s ease;

  &::placeholder {
    color: rgba(70, 93, 107, 0.5);
  }

  &:focus {
    outline: none;
    border-color: var(--color-dark);
    box-shadow: 0 0 0 3px rgba(70, 93, 107, 0.15);
  }
`;

const MensajeError = styled.p`
  color: var(--color-red);
  font-weight: 600;
  font-size: 14px;
  text-align: center;
  margin-bottom: 16px;
  background-color: rgba(216, 87, 93, 0.08);
  padding: 8px 16px;
  border-radius: 8px;
`;

// --- VISTA 3: CREAR SALA ---
const CrearContent = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 620px;
  margin-top: 5px;
  animation: fadeIn 0.3s ease;
  position: relative;
  z-index: 2;
`;


const CamposCrearRow = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  margin-bottom: 24px;

  @media (max-width: 540px) {
    flex-direction: column;
  }
`;

const InputPequeno = styled.input`
  flex: 1;
  height: 46px;
  background-color: #ffffff;
  border: 1.5px solid rgba(70, 93, 107, 0.25);
  border-radius: 10px;
  font-family: var(--font-sans);
  font-size: 15px;
  padding: 0 14px;
  color: var(--color-dark);

  &::placeholder {
    color: rgba(70, 93, 107, 0.5);
  }

  &:focus {
    outline: none;
    border-color: var(--color-dark);
  }
`;

const SubtituloLlamadas = styled.h3`
  font-family: var(--font-theme);
  color: var(--color-dark);
  font-size: clamp(20px, 4.5vw, 28px);
  text-align: center;
  margin: 8px 0 4px;
`;

const TextoAyudaPatrones = styled.p`
  font-family: var(--font-sans);
  color: rgba(70, 93, 107, 0.78);
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  margin: 0 0 20px;
`;

const GrillaPatrones = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  width: 100%;
  margin-bottom: 28px;

  @media (max-width: 520px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
`;

const MiniCuadricula = styled.div`
  width: 84px;
  height: 96px;
  background-color: #81AEB7;
  border-radius: 6px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  padding: 3px;
  position: relative;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
`;

const TarjetaPatron = styled.button`
  background: transparent;
  border: none;
  padding: 6px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:hover ${MiniCuadricula} {
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.18);
  }
`;

const Celda = styled.div`
  border: 0.75px solid rgba(255, 255, 255, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FichaCirculo = styled.div`
  width: 12px;
  height: 12px;
  background-color: #F9EEDB;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`;

const checkPop = keyframes`
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  75% {
    transform: scale(1.08);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const CheckPincelada = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  z-index: 3;
  animation: ${checkPop} 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  img {
    width: 90%;
    height: 90%;
    object-fit: contain;
    filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3));
  }
`;

const NombrePatron = styled.span`
  font-family: var(--font-theme);
  font-size: 15px;
  color: var(--color-dark);
  margin-top: 8px;
  text-align: center;
  letter-spacing: 0.3px;
`;

const BotonCrearFinal = styled(BotonBase)`
  background-color: var(--color-dark);
  max-width: 220px;
  min-height: 52px;
  margin-bottom: 20px;
  box-shadow: 0 5px 15px rgba(70, 93, 107, 0.35);

  &:hover {
    box-shadow: 0 7px 20px rgba(70, 93, 107, 0.5);
  }
`;

export default Home;

import { useEffect, useState } from 'react'
import styled from 'styled-components'
import Card from '../Card/Card'

// Importa automáticamente todas las imágenes .webp de la carpeta cards.
// Las claves son rutas tipo '../../assets/cards/23.webp'.
const cardImages = import.meta.glob('../../assets/cards/*.webp', {
  eager: true,
  import: 'default',
}) as Record<string, string>

// Busca la imagen local cuyo nombre de archivo (sin extensión) sea igual al id.
const imagenPorId = (id: number): string | undefined => {
  const entry = Object.entries(cardImages).find(([path]) => {
    const nombreArchivo = path.split('/').pop()?.split('.')[0]?.trim()
    return nombreArchivo === String(id)
  })
  return entry?.[1]
}

interface BoardCard {
  id: number
  name: string
}

interface BoardProps {
  accountNumber: string
  roomCode: string
}

const Board = ({ accountNumber, roomCode }: BoardProps) => {
  const [cartas, setCartas] = useState<BoardCard[]>([])
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const pedirTabla = async () => {
      setCargando(true)
      setError('')

      try {
        const response = await fetch(
          `http://localhost:3000/api/rooms/${roomCode}/board/${accountNumber}`
        )
        const data = await response.json()

        if (!response.ok || !data.ok) {
          setError(data.message || 'No se pudo obtener tu tabla')
          return
        }

        // RF-04 / RF-05: la tabla ya viene validada desde el backend
        // (16 cartas, sin repetidas). Aqui solo se muestra.
        setCartas(data.data.cards)
      } catch (err) {
        setError('No se pudo conectar con el servidor')
        console.error(err)
      } finally {
        setCargando(false)
      }
    }

    pedirTabla()
  }, [accountNumber, roomCode])

  if (cargando) {
    return <p>Cargando tu tabla...</p>
  }

  if (error) {
    return <p style={{ color: '#e0245e' }}>{error}</p>
  }

  return (
    <StyledBoard>
      {cartas.map((carta) => {
        const image = imagenPorId(carta.id)
        return <Card key={carta.id} image={image ?? ''} name={carta.name} />
      })}
    </StyledBoard>
  )
}

const StyledBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  justify-items: center;
  padding: 32px;
  max-width: 900px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

export default Board
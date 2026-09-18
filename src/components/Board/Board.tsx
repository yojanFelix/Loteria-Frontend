import styled from 'styled-components'
import Card from '../Card/Card'

// Importa automáticamente todas las imágenes .webp de la carpeta cards.
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
  board: { cards: BoardCard[] }
  roomCode: string
}

// RF-04 / RF-05: la tabla ya viene armada y validada desde el backend
// (16 cartas, sin repetidas) al crear o unirse a la sala. Aqui solo se
// muestra, ya no se genera nada localmente.
const Board = ({ board, roomCode }: BoardProps) => {
  return (
    <div>
      <p style={{ textAlign: 'center' }}>Sala: {roomCode}</p>
      <StyledBoard>
        {board.cards.map((carta) => {
          const image = imagenPorId(carta.id)
          return <Card key={carta.id} image={image ?? ''} name={carta.name} />
        })}
      </StyledBoard>
    </div>
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
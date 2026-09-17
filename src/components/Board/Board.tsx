import styled from 'styled-components'
import Card from '../Card/Card'

// Importa automáticamente todas las imágenes .webp de la carpeta cards
const cardImages = import.meta.glob('../../assets/cards/*.webp', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const Board = () => {
  const cartas = Object.entries(cardImages)
    .sort(() => Math.random() - 0.5) // mezcla aleatoriamente
    .slice(0, 16)
    .map(([path, image]) => {
      const nombreArchivo = path.split('/').pop()?.split('.')[0] ?? 'carta'
      return { image, name: nombreArchivo }
    })

  return (
    <StyledBoard>
      {cartas.map((carta, index) => (
        <Card key={index} image={carta.image} name={carta.name} />
      ))}
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
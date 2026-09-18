import styled from 'styled-components'
import Card from '../Card/Card'

// Generamos un arreglo aleatorio de 16 cartas para la vista previa del menú
const cartasAleatorias = Array.from({ length: 54 }, (_, i) => i + 1)
  .sort(() => Math.random() - 0.5)
  .slice(0, 16)
  .map((id) => ({
    image: `/cards/${id}.webp`,
    name: `Carta ${id}`,
  }))

// Vista previa decorativa del menú: 16 cartas al azar.
// La tabla real de la partida llega del backend y se pinta en WaitingRoom.
const Board = () => {
  return (
    <StyledBoard>
      {cartasAleatorias.map((carta, index) => (
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
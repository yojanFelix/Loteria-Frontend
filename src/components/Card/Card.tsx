import styled from 'styled-components'

interface CardProps {
  image: string;
  name: string;
}

const Card = ({ image, name }: CardProps) => {
  return (
    <StyledWrapper>
      <div className="card">
        <img src={image} alt={name} className="card-image" />
      </div>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  .card {
    width: 190px;
    height: 254px;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 8px 14px 0 rgba(0, 0, 0, 0.2);
  }

  .card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`

export default Card
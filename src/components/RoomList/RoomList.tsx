import './RoomList.css';

export interface Room {
  code: string; // Ejemplo: "ABC-123"
  name: string;
  playersCount: number;
}

interface RoomListProps {
  rooms: Room[];
}

function RoomList({ rooms }: RoomListProps) {
  return (
    <div className="room-list-card">
      <h3>Salas Disponibles</h3>
      {rooms.length === 0 ? (
        <p>No hay salas activas en este momento.</p>
      ) : (
        <ul className="room-items">
          {rooms.map((room) => (
            <li key={room.code} className="room-item">
              <div className="room-info">
                <span className="room-name">{room.name}</span>
                <span className="room-code">Código: <strong>{room.code}</strong></span>
                <span className="room-players">Jugadores: {room.playersCount}</span>
              </div>
              <button className="join-btn">Unirse</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RoomList;
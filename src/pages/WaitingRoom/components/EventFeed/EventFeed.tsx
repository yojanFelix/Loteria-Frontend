import { useGameStore } from '../../../../store/gameStore';

export default function EventFeed() {
  const notificaciones = useGameStore((state) => state.notificaciones);

  return (
    <div className="feed-notificaciones">
      <h3>Jugadas de la sala</h3>
      {notificaciones.length === 0 ? (
        <p className="cargando">Aún no hay jugadas destacadas</p>
      ) : (
        <ul className="lista-notificaciones">
          {notificaciones.map((notif, index) => (
            <li key={`${notif.accountNumber}-${index}`}>{notif.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

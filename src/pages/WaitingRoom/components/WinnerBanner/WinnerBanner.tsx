import { TrophyIcon } from '../../../../components/Icons/Icons';
import { etiquetaDePatron } from '../../../../utils/constants';
import type { GanadorInfo } from '../../../../types/game.types';

interface WinnerBannerProps {
  ganador: GanadorInfo;
  aliasGanador: string;
}

export default function WinnerBanner({ ganador, aliasGanador }: WinnerBannerProps) {
  return (
    <div className="banner-ganador">
      <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <TrophyIcon size={28} color="#d97706" />
        <span>¡Lotería!</span>
        <TrophyIcon size={28} color="#d97706" />
      </h2>
      <p>
        Ganó <strong>{aliasGanador}</strong> con {etiquetaDePatron(ganador.pattern)}
      </p>
    </div>
  );
}

import { FC } from 'react';
import { IUserAchievement } from '../../../achievements/types/achievements.types';
import './achievements-block.component.scss';
import { useTranslation } from 'react-i18next';

interface Props {
  achievements: IUserAchievement[];
}

const AchievementsBlock: FC<Props> = ({ achievements }) => {
  const { t } = useTranslation('profile');

  if (!achievements || achievements.length === 0) {
    return (
      <div className="achievements-block empty">
        <p>{t('achievements.empty')}</p>
      </div>
    );
  }

  return (
    <div className="achievements-block">
      <div className="achievements-header">
        <h2>{t('achievements.title')} ({achievements.length})</h2>
      </div>

      <div className="achievements-content">
        {achievements.map(ua => (
          <div className={`achievement-item rarity-${ua.achievement.rarity}`} key={ua.id}>
            <div className="icon">
              {ua.achievement.iconUrl ? (
                <img src={ua.achievement.iconUrl} alt={ua.achievement.title} />
              ) : (
                <span className="emoji">🏆</span>
              )}
            </div>
            <div className="info">
              <h4>{ua.achievement.title}</h4>
              <p>{ua.achievement.description}</p>
              <span className="date">{t('achievements.earned')} {new Date(ua.earnedAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsBlock;

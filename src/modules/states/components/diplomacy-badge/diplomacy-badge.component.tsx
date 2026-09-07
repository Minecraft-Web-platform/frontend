import { FC } from 'react';
import './diplomacy-badge.component.scss';
import { DiplomacyStatus } from '../../types/states.types';
import { useTranslation } from 'react-i18next';

interface DiplomacyBadgeProps {
  status: DiplomacyStatus;
}

const DiplomacyBadge: FC<DiplomacyBadgeProps> = ({ status }) => {
  const { t } = useTranslation('states');
  const getStatusInfo = () => {
    switch (status) {
      case 'ally':
        return { label: t('diplomacyBadge.ally'), icon: '🤝', className: 'diplomacy-badge--ally' };
      case 'war':
        return { label: t('diplomacyBadge.war'), icon: '⚔️', className: 'diplomacy-badge--war' };
      case 'neutral':
      default:
        return { label: t('diplomacyBadge.neutral'), icon: '🕊️', className: 'diplomacy-badge--neutral' };
    }
  };

  const info = getStatusInfo();

  return (
    <span className={`diplomacy-badge ${info.className}`}>
      <span>{info.icon}</span>
      <span>{info.label}</span>
    </span>
  );
};

export default DiplomacyBadge;

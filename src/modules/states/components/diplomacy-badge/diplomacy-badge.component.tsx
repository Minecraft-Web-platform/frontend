import { FC } from 'react';
import './diplomacy-badge.component.scss';
import { DiplomacyStatus } from '../../types/states.types';

interface DiplomacyBadgeProps {
  status: DiplomacyStatus;
}

const DiplomacyBadge: FC<DiplomacyBadgeProps> = ({ status }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'ally':
        return { label: 'Союзник', icon: '🤝', className: 'diplomacy-badge--ally' };
      case 'war':
        return { label: 'Война', icon: '⚔️', className: 'diplomacy-badge--war' };
      case 'neutral':
      default:
        return { label: 'Нейтралитет', icon: '🕊️', className: 'diplomacy-badge--neutral' };
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

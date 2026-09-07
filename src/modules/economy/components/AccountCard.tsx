import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { IAccount, ICard } from '../types/economy.types';
import './AccountCard.scss';

interface AccountCardProps {
  account: IAccount;
  cards: ICard[];
  onIssueCard?: (accountId: string) => void;
  onTransferClick?: (accountNumber: string) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  cards,
  onIssueCard,
  onTransferClick,
}) => {
  const [, setSearchParams] = useSearchParams();
  const { t } = useTranslation('economy');
  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'personal':
        return 'account-card__badge--personal';
      case 'company':
        return 'account-card__badge--company';
      case 'treasury':
        return 'account-card__badge--treasury';
      default:
        return '';
    }
  };

  const getBadgeLabel = (type: string) => {
    switch (type) {
      case 'personal':
        return t('accountCard.personalAccount');
      case 'company':
        return t('accountCard.companyAccount');
      case 'treasury':
        return t('accountCard.stateTreasury');
      default:
        return type;
    }
  };

  const formatAccountNumber = (num: string) => {
    if (!num || num.length < 12) return num;
    return `${num.slice(0, 5)} •••• •••• ${num.slice(-4)}`;
  };

  const formatCardNumber = (num: string) => {
    if (!num || num.length < 16) return num;
    return `${num.slice(0, 4)} •••• •••• ${num.slice(-4)}`;
  };

  return (
    <div className="account-card">
      <div>
        <div className="account-card__header">
          <span className={`account-card__badge ${getBadgeClass(account.type)}`}>
            {getBadgeLabel(account.type)}
          </span>
          <span className="account-card__currency-code">
            {account.currencyCode}
          </span>
        </div>

        <div className="account-card__balance-section">
          <div className="label">{t('accountCard.balance')}</div>
          <div className="balance">
            <span>{account.balance.toLocaleString('ru-RU')}</span>{' '}
            <span className="currency" style={{ marginLeft: '6px' }}>
              {account.currencyCode}
            </span>
          </div>
          <div className="account-num">
            № {formatAccountNumber(account.accountNumber)}
          </div>
        </div>

        {cards.length > 0 && (
          <div className="account-card__cards-section">
            <div className="cards-title">
              {t('accountCard.linkedCards')} ({cards.length})
            </div>
            <div className="cards-list">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="card-item"
                  onClick={() => setSearchParams({ tab: 'cards', cardId: card.id })}
                  title={t('accountCard.clickToManage')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-info">
                    <div className="card-chip">CARD</div>
                    <div>
                      <div className="card-number">
                        {formatCardNumber(card.cardNumber)}
                      </div>
                      <div className="card-meta">
                        {t('accountCard.validThru', { date: card.expiresAt })}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`card-status ${
                      card.isBlocked
                        ? 'card-status--blocked'
                        : 'card-status--active'
                    }`}
                  >
                    {card.isBlocked ? t('accountCard.blocked') : t('accountCard.active')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="account-card__actions">
        {onTransferClick && (
          <button
            onClick={() => onTransferClick(account.accountNumber)}
            className="economy-btn economy-btn--primary"
            style={{ flex: 1 }}
          >
            {t('accountCard.transfer')}
          </button>
        )}
        {onIssueCard && (
          <button
            onClick={() => onIssueCard(account.id)}
            className="economy-btn economy-btn--secondary"
            style={{ flex: 1 }}
          >
            {t('accountCard.issueCard')}
          </button>
        )}
      </div>
    </div>
  );
};


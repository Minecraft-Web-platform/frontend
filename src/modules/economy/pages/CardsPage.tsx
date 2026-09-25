import {  } from 'axios';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { IAccount, ICard } from '../types/economy.types';
import { economyService } from '../services/economy.service';
import { BankCard3D } from '../components/BankCard3D/BankCard3D';
import './CardsPage.scss';

export const CardsPage: React.FC = () => {
  const { t } = useTranslation('economy');
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCardId = searchParams.get('cardId') || null;

  const [cards, setCards] = useState<ICard[]>([]);
  const [accounts, setAccounts] = useState<IAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal issue card
  const [showIssueModal, setShowIssueModal] = useState<boolean>(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  const [copyToast, setCopyToast] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cardsRes, accountsRes] = await Promise.all([
        economyService.getMyCards(),
        economyService.getMyAccounts(),
      ]);
      setCards(cardsRes);
      setAccounts(accountsRes.accounts);
      if (accountsRes.accounts.length > 0 && !selectedAccountId) {
        setSelectedAccountId(accountsRes.accounts[0].id);
      }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e?.message || t('cards.errors.load'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleIssueCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId) {
      alert(t('cards.errors.selectAccount'));
      return;
    }
    try {
      await economyService.issueCard({ accountId: selectedAccountId });
      setShowIssueModal(false);
      await loadData();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.message || t('cards.errors.issue'));
    }
  };

  const handleToggleBlock = async (cardId: string) => {
    try {
      await economyService.toggleBlockCard(cardId);
      await loadData();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.message || t('cards.errors.status'));
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!window.confirm(t('cards.deleteConfirm'))) {
      return;
    }
    try {
      await economyService.deleteCard(cardId);
      setSearchParams({ tab: 'cards' });
      await loadData();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.message || t('cards.errors.delete'));
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyToast(t('cards.copied', { label }));
    setTimeout(() => {
      setCopyToast(null);
    }, 2500);
  };

  const formatCardNumberFull = (num: string) => {
    if (!num || num.length < 16) return num;
    return num.match(/.{1,4}/g)?.join('  ') || num;
  };

  const getAccountLabel = (acc?: IAccount) => {
    if (!acc) return t('cards.accountTypes.unknown');
    const typeName =
      acc.type === 'personal'
        ? t('cards.accountTypes.personal')
        : acc.type === 'company'
        ? t('cards.accountTypes.company')
        : t('cards.accountTypes.treasury');
    return `${typeName} №${acc.accountNumber.slice(0, 5)}...${acc.accountNumber.slice(-4)} (${acc.currencyCode})`;
  };

  const activeCount = cards.filter((c) => !c.isBlocked).length;
  const blockedCount = cards.filter((c) => c.isBlocked).length;

  // Find selected card
  const currentCard = cards.find((c) => c.id === selectedCardId);

  if (loading && cards.length === 0) {
    return (
      <div className="cards-page" style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
        {t('cards.loading')}
      </div>
    );
  }

  // === MODE 2: Detailed single card view ===
  if (selectedCardId && currentCard) {
    const linkedAcc = currentCard.account || accounts.find((a) => a.id === currentCard.accountId);

    return (
      <div className="cards-page">
        {copyToast && (
          <div
            style={{
              position: 'fixed',
              top: '24px',
              right: '24px',
              background: '#0f172a',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              zIndex: 9999,
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            ✅ {copyToast}
          </div>
        )}

        <div className="cards-page__detail">
          <div className="back-nav">
            <button onClick={() => setSearchParams({ tab: 'cards' })}>
              {t('cards.backToList')}
            </button>
          </div>

          <div className="detail-grid">
            <div className="detail-card-column">
              <BankCard3D card={currentCard} account={linkedAcc} />
            </div>

            {/* Right column: Details, linked account and actions */}
            <div className="detail-info-column">
              {/* Linked account */}
              <div className="info-card">
                <h3 className="info-card__title">
                  {t('cards.linkedAccount')}
                </h3>
                {linkedAcc ? (
                  <>
                    <div className="info-row">
                      <span className="row-label">{t('cards.accountType')}</span>
                      <span className="row-value">
                        {linkedAcc.type === 'personal'
                          ? t('cards.accountTypes.personal')
                          : linkedAcc.type === 'company'
                          ? t('cards.accountTypes.company')
                          : t('cards.accountTypes.treasury')}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="row-label">{t('cards.accountNumber')}</span>
                      <span className="row-value">
                        № {linkedAcc.accountNumber}
                        <button
                          className="copy-btn"
                          onClick={() => handleCopy(linkedAcc.accountNumber, t('cards.accountNumber'))}
                          title={t('cards.copy')}
                        >
                          📋
                        </button>
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="row-label">{t('cards.currentBalance')}</span>
                      <span className="row-value row-value--balance">
                        {linkedAcc.balance.toLocaleString('ru-RU')}{' '}
                        {linkedAcc.currencyCode}
                      </span>
                    </div>
                  </>
                ) : (
                  <p style={{ color: '#64748b' }}>
                    {t('cards.loading')}
                  </p>
                )}
              </div>

              {/* Card details */}
              <div className="info-card">
                <h3 className="info-card__title">
                  {t('cards.paymentDetails')}
                </h3>
                <div className="info-row">
                  <span className="row-label">{t('cards.cardNumber')}</span>
                  <span className="row-value">
                    {formatCardNumberFull(currentCard.cardNumber)}
                    <button
                      className="copy-btn"
                      onClick={() => handleCopy(currentCard.cardNumber, t('cards.cardNumber'))}
                      title={t('cards.copy')}
                    >
                      📋
                    </button>
                  </span>
                </div>
                <div className="info-row">
                  <span className="row-label">{t('cards.validThru')}</span>
                  <span className="row-value">
                    {currentCard.expiresAt}
                    <button
                      className="copy-btn"
                      onClick={() => handleCopy(currentCard.expiresAt, t('cards.validThru'))}
                      title={t('cards.copy')}
                    >
                      📋
                    </button>
                  </span>
                </div>
                <div className="info-row">
                  <span className="row-label">{t('cards.cvvCode')}</span>
                  <span className="row-value">
                    {currentCard.cvv}
                    <button
                      className="copy-btn"
                      onClick={() => handleCopy(currentCard.cvv, t('cards.cvvCode'))}
                      title={t('cards.copy')}
                    >
                      📋
                    </button>
                  </span>
                </div>
              </div>

              {/* Management and Security */}
              <div className="info-card">
                <h3 className="info-card__title">
                  {t('cards.management')}
                </h3>
                <div className="actions-grid">
                  <button
                    className={`action-btn ${
                      currentCard.isBlocked
                        ? 'action-btn--unblock'
                        : 'action-btn--block'
                    }`}
                    onClick={() => handleToggleBlock(currentCard.id)}
                  >
                    {currentCard.isBlocked ? t('cards.unblockCard') : t('cards.blockCard')}
                  </button>

                  <button
                    className="action-btn action-btn--transfer"
                    onClick={() => setSearchParams({ tab: 'bank' })}
                  >
                    {t('cards.transferFromAccount')}
                  </button>

                  <button
                    className="action-btn action-btn--delete"
                    onClick={() => handleDeleteCard(currentCard.id)}
                  >
                    {t('cards.deleteCard')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === MODE 1: General card list ===
  return (
    <div className="cards-page">
      {/* Hero */}
      <div className="cards-page__hero">
        <div className="hero-text">
          <h2>{t('cards.title')}</h2>
          <p>{t('cards.subtitle')}</p>
        </div>

        <div className="hero-stats">
          <div className="stat-pill">
            <span className="label">{t('cards.totalCards')}</span>
            <span className="value">{cards.length}</span>
          </div>
          <div className="stat-pill">
            <span className="label">{t('cards.active')}</span>
            <span className="value value--active">
              {activeCount}
            </span>
          </div>
          <div className="stat-pill">
            <span className="label">{t('cards.blocked')}</span>
            <span className="value value--blocked">
              {blockedCount}
            </span>
          </div>
        </div>

        {cards.length > 0 && (
          <div className="hero-actions">
            <button
              className="economy-btn economy-btn--primary"
              onClick={() => setShowIssueModal(true)}
            >
              {t('cards.issueCard')}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div style={{ color: '#dc2626', marginBottom: '16px', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Cards Grid */}
      {cards.length === 0 ? (
        <div className="cards-page__empty">
          <div className="icon">💳</div>
          <h3>{t('cards.emptyTitle')}</h3>
          <p>{t('cards.emptyDesc')}</p>
          <button
            className="economy-btn economy-btn--primary"
            onClick={() => setShowIssueModal(true)}
          >
            {t('cards.issueFirstCard')}
          </button>
        </div>
      ) : (
        <div className="cards-page__grid">
          {cards.map((card) => {
            const linkedAcc = card.account || accounts.find((a) => a.id === card.accountId);

            return (
              <div
                key={card.id}
                className="cards-page__grid-item"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setSearchParams({ tab: 'cards', cardId: card.id });
                }}
              >
                <BankCard3D card={card} account={linkedAcc} disableRotation={true} />
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Issue Card */}
      {showIssueModal && (
        <div className="economy-modal-overlay" onClick={() => setShowIssueModal(false)}>
          <div className="economy-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{t('cards.issueModal.title')}</h3>
            <form onSubmit={handleIssueCard} className="modal-form">
              <label>
                <span>{t('cards.issueModal.selectAccount')}</span>
                {accounts.length === 0 ? (
                  <p style={{ color: '#dc2626', fontSize: '14px', margin: '8px 0' }}>
                    {t('cards.issueModal.noAccounts')}
                  </p>
                ) : (
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    required
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {getAccountLabel(acc)} — {t('accountCard.balance')}: {acc.balance.toLocaleString('ru-RU')} {acc.currencyCode}
                      </option>
                    ))}
                  </select>
                )}
              </label>

              <div className="modal-actions">
                {accounts.length === 0 ? (
                  <button
                    type="button"
                    className="economy-btn economy-btn--secondary"
                    onClick={() => setShowIssueModal(false)}
                  >
                    {t('cards.issueModal.close')}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="economy-btn economy-btn--secondary"
                      onClick={() => setShowIssueModal(false)}
                    >
                      {t('cards.issueModal.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="economy-btn economy-btn--primary"
                    >
                      {t('cards.issueModal.submit')}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

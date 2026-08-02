import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { IAccount, ICard } from '../types/economy.types';
import { economyService } from '../services/economy.service';
import './CardsPage.scss';

export const CardsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCardId = searchParams.get('cardId') || null;

  const [cards, setCards] = useState<ICard[]>([]);
  const [accounts, setAccounts] = useState<IAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Модальное окно выпуска карты
  const [showIssueModal, setShowIssueModal] = useState<boolean>(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  // Состояние отображения секретных реквизитов (CVV, полный номер)
  const [revealSecrets, setRevealSecrets] = useState<boolean>(false);
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
    } catch (e: any) {
      setError(e?.message || 'Ошибка загрузки пластиковых карт');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssueCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId) {
      alert('Выберите счет для привязки карты');
      return;
    }
    try {
      await economyService.issueCard({ accountId: selectedAccountId });
      setShowIssueModal(false);
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Ошибка при выпуске карты');
    }
  };

  const handleToggleBlock = async (cardId: string) => {
    try {
      await economyService.toggleBlockCard(cardId);
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Ошибка изменения статуса карты');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить и закрыть эту пластиковую карту?')) {
      return;
    }
    try {
      await economyService.deleteCard(cardId);
      setSearchParams({ tab: 'cards' });
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Ошибка удаления карты');
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyToast(`Скопировано: ${label}`);
    setTimeout(() => {
      setCopyToast(null);
    }, 2500);
  };

  const formatCardNumberMasked = (num: string) => {
    if (!num || num.length < 16) return num;
    return `${num.slice(0, 4)}  ••••  ••••  ${num.slice(-4)}`;
  };

  const formatCardNumberFull = (num: string) => {
    if (!num || num.length < 16) return num;
    return num.match(/.{1,4}/g)?.join('  ') || num;
  };

  const getAccountLabel = (acc?: IAccount) => {
    if (!acc) return 'Неизвестный счет';
    const typeName =
      acc.type === 'personal'
        ? 'Личный счет'
        : acc.type === 'company'
        ? 'Коммерческий счет'
        : 'Казначейский счет';
    return `${typeName} №${acc.accountNumber.slice(0, 5)}...${acc.accountNumber.slice(-4)} (${acc.currencyCode})`;
  };

  const formatBankBrand = (bankName?: string) => {
    const name = (bankName || 'НАЦИОНАЛЬНЫЙ БАНК').toUpperCase();
    const parts = name.split(' ');
    if (parts.length > 1) {
      const lastWord = parts.pop();
      return (
        <>
          {parts.join(' ')} <span>{lastWord}</span>
        </>
      );
    }
    return <span>{name}</span>;
  };

  const activeCount = cards.filter((c) => !c.isBlocked).length;
  const blockedCount = cards.filter((c) => c.isBlocked).length;

  // Найти выбранную карту
  const currentCard = cards.find((c) => c.id === selectedCardId);

  if (loading && cards.length === 0) {
    return (
      <div className="cards-page" style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
        Загрузка банковских карт...
      </div>
    );
  }

  // === РЕЖИМ 2: Детальный просмотр одной карты ===
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
              ← Назад к списку карт
            </button>
          </div>

          <div className="detail-grid">
            {/* Левая колонка: Крупная визуальная карта */}
            <div className="detail-card-column">
              <div
                className={`plastic-card plastic-card--large ${
                  currentCard.isBlocked ? 'plastic-card--blocked' : ''
                }`}
              >
                <div className="plastic-card__top">
                  <div className="brand">
                    {formatBankBrand(currentCard.bankName || (linkedAcc && linkedAcc.bankName))}
                  </div>
                  <span
                    className={`status-badge ${
                      currentCard.isBlocked
                        ? 'status-badge--blocked'
                        : 'status-badge--active'
                    }`}
                  >
                    {currentCard.isBlocked ? 'Заблокирована' : 'Активна'}
                  </span>
                </div>

                <div className="plastic-card__chip-row">
                  <div className="chip" />
                  <span className="contactless">(((</span>
                </div>

                <div className="plastic-card__number">
                  {revealSecrets
                    ? formatCardNumberFull(currentCard.cardNumber)
                    : formatCardNumberMasked(currentCard.cardNumber)}
                </div>

                <div className="plastic-card__bottom">
                  <div className="holder">
                    <div className="label">ВЛАДЕЛЕЦ КАРТЫ</div>
                    <div className="name">
                      {linkedAcc ? linkedAcc.ownerUsername : 'СЕРВЕРНЫЙ ГРАЖДАНИН'}
                    </div>
                  </div>
                  <div className="expiry">
                    <div className="label">ГОДНА ДО / CVV</div>
                    <div className="val">
                      {currentCard.expiresAt} / {revealSecrets ? currentCard.cvv : '•••'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Управление отображением секретов */}
              <div className="card-controls">
                <span className="control-label">
                  {revealSecrets
                    ? '👁️ Реквизиты открыты'
                    : '🔒 Номер и CVV скрыты'}
                </span>
                <button
                  className="eye-btn"
                  onClick={() => setRevealSecrets(!revealSecrets)}
                >
                  {revealSecrets ? 'Скрыть реквизиты' : 'Показать номер и CVV'}
                </button>
              </div>
            </div>

            {/* Правая колонка: Реквизиты, привязанный счет и действия */}
            <div className="detail-info-column">
              {/* Привязанный счет */}
              <div className="info-card">
                <h3 className="info-card__title">
                  🏦 Привязанный банковский счет
                </h3>
                {linkedAcc ? (
                  <>
                    <div className="info-row">
                      <span className="row-label">Тип счета:</span>
                      <span className="row-value">
                        {linkedAcc.type === 'personal'
                          ? 'Личный счет'
                          : linkedAcc.type === 'company'
                          ? 'Коммерческий счет'
                          : 'Казначейский счет'}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="row-label">Номер счета:</span>
                      <span className="row-value">
                        № {linkedAcc.accountNumber}
                        <button
                          className="copy-btn"
                          onClick={() => handleCopy(linkedAcc.accountNumber, 'Номер счета')}
                          title="Скопировать"
                        >
                          📋
                        </button>
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="row-label">Текущий баланс:</span>
                      <span className="row-value row-value--balance">
                        {linkedAcc.balance.toLocaleString('ru-RU')}{' '}
                        {linkedAcc.currencyCode}
                      </span>
                    </div>
                  </>
                ) : (
                  <p style={{ color: '#64748b' }}>
                    Информация о счете загружается или счет был удален...
                  </p>
                )}
              </div>

              {/* Реквизиты карты с быстрым копированием */}
              <div className="info-card">
                <h3 className="info-card__title">
                  📋 Реквизиты для оплаты и переводов
                </h3>
                <div className="info-row">
                  <span className="row-label">Номер карты:</span>
                  <span className="row-value">
                    {formatCardNumberFull(currentCard.cardNumber)}
                    <button
                      className="copy-btn"
                      onClick={() => handleCopy(currentCard.cardNumber, 'Номер карты')}
                      title="Скопировать"
                    >
                      📋
                    </button>
                  </span>
                </div>
                <div className="info-row">
                  <span className="row-label">Срок действия:</span>
                  <span className="row-value">
                    {currentCard.expiresAt}
                    <button
                      className="copy-btn"
                      onClick={() => handleCopy(currentCard.expiresAt, 'Срок действия')}
                      title="Скопировать"
                    >
                      📋
                    </button>
                  </span>
                </div>
                <div className="info-row">
                  <span className="row-label">Код CVV/CVC:</span>
                  <span className="row-value">
                    {currentCard.cvv}
                    <button
                      className="copy-btn"
                      onClick={() => handleCopy(currentCard.cvv, 'CVV код')}
                      title="Скопировать"
                    >
                      📋
                    </button>
                  </span>
                </div>
              </div>

              {/* Управление и безопасность */}
              <div className="info-card">
                <h3 className="info-card__title">
                  ⚙️ Управление картой и безопасность
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
                    {currentCard.isBlocked ? '🔓 Разблокировать карту' : '🔒 Заблокировать карту'}
                  </button>

                  <button
                    className="action-btn action-btn--transfer"
                    onClick={() => setSearchParams({ tab: 'bank' })}
                  >
                    💸 Перевести со счета
                  </button>

                  <button
                    className="action-btn action-btn--delete"
                    onClick={() => handleDeleteCard(currentCard.id)}
                  >
                    🗑️ Закрыть и удалить карту
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === РЕЖИМ 1: Общий список карт ===
  return (
    <div className="cards-page">
      {/* Шапка / Герой */}
      <div className="cards-page__hero">
        <div className="hero-text">
          <h2>💳 Банковские и Пластиковые Карты</h2>
          <p>
            Пластиковые карты позволяют совершать быстрые расчеты, управлять доступом к счетам 
            и контролировать безопасность ваших финансов.
          </p>
        </div>

        <div className="hero-stats">
          <div className="stat-pill">
            <span className="label">Всего карт</span>
            <span className="value">{cards.length}</span>
          </div>
          <div className="stat-pill">
            <span className="label">Активных</span>
            <span className="value" style={{ color: '#34d399' }}>
              {activeCount}
            </span>
          </div>
          <div className="stat-pill">
            <span className="label">Заблокир.</span>
            <span className="value" style={{ color: '#f87171' }}>
              {blockedCount}
            </span>
          </div>
        </div>

        <div className="hero-actions">
          <button
            className="economy-btn economy-btn--primary"
            onClick={() => setShowIssueModal(true)}
          >
            + Выпустить карту
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: '#dc2626', marginBottom: '16px', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Сетка карт */}
      {cards.length === 0 ? (
        <div className="cards-page__empty">
          <div className="icon">💳</div>
          <h3>У вас пока нет пластиковых карт</h3>
          <p>
            Выпустите свою первую банковскую карту к любому из ваших личных или коммерческих счетов, 
            чтобы управлять оплатой и переводами.
          </p>
          <button
            className="economy-btn economy-btn--primary"
            onClick={() => setShowIssueModal(true)}
          >
            + Выпустить первую карту
          </button>
        </div>
      ) : (
        <div className="cards-page__grid">
          {cards.map((card) => {
            const linkedAcc = card.account || accounts.find((a) => a.id === card.accountId);

            return (
              <div
                key={card.id}
                className={`plastic-card ${
                  card.isBlocked ? 'plastic-card--blocked' : ''
                }`}
                onClick={() => setSearchParams({ tab: 'cards', cardId: card.id })}
              >
                <div className="plastic-card__top">
                  <div className="brand">
                    {formatBankBrand(card.bankName || (linkedAcc && linkedAcc.bankName))}
                  </div>
                  <span
                    className={`status-badge ${
                      card.isBlocked
                        ? 'status-badge--blocked'
                        : 'status-badge--active'
                    }`}
                  >
                    {card.isBlocked ? 'Заблокирована' : 'Активна'}
                  </span>
                </div>

                <div className="plastic-card__chip-row">
                  <div className="chip" />
                  <span className="contactless">(((</span>
                </div>

                <div className="plastic-card__number">
                  {formatCardNumberMasked(card.cardNumber)}
                </div>

                <div className="plastic-card__bottom">
                  <div className="holder">
                    <div className="label">СЧЕТ ПРИВЯЗКИ</div>
                    <div className="name">
                      {linkedAcc ? getAccountLabel(linkedAcc) : `Счет ID: ${card.accountId.slice(0, 8)}`}
                    </div>
                  </div>
                  <div className="expiry">
                    <div className="label">ГОДНА ДО</div>
                    <div className="val">{card.expiresAt}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Модальное окно: Выпуск карты */}
      {showIssueModal && (
        <div className="modal-overlay" onClick={() => setShowIssueModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Выпуск новой пластиковой карты</h3>
              <button
                className="modal-close"
                onClick={() => setShowIssueModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleIssueCard}>
              <div className="form-group">
                <label>Выберите счет для привязки карты:</label>
                {accounts.length === 0 ? (
                  <p style={{ color: '#dc2626', fontSize: '14px' }}>
                    У вас нет открытых счетов. Сначала откройте счет на вкладке «Банки и Счета».
                  </p>
                ) : (
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    required
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {getAccountLabel(acc)} — Баланс: {acc.balance.toLocaleString('ru-RU')} {acc.currencyCode}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="economy-btn economy-btn--secondary"
                  onClick={() => setShowIssueModal(false)}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="economy-btn economy-btn--primary"
                  disabled={accounts.length === 0}
                >
                  Выпустить карту
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

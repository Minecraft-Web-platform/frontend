import {  } from 'axios';
import React, { useEffect, useState } from 'react';
import { ICurrency } from '../types/economy.types';
import { economyService } from '../services/economy.service';
import { CurrencyCard } from '../components/CurrencyCard';
import { profileService } from '../../profile/services/profile.service';
import { statesService, IState } from '../../states';
import Sidebar from '../../../shared/ui/sidebar/sidebar.component';
import '../economy-shared.scss';

export const CurrenciesPage: React.FC<{ embedded?: boolean }> = ({
  embedded = false,
}) => {
  const [currencies, setCurrencies] = useState<ICurrency[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Модальное окно эмиссии
  const [issueCurrencyId, setIssueCurrencyId] = useState<string | null>(null);
  const [issueAmount, setIssueAmount] = useState('');

  const loadCurrencies = async () => {
    try {
      setLoading(true);
      setError(null);
      const [currRes, statesRes, meRes] = await Promise.all([
        economyService.getAllCurrencies(),
        statesService.getStates().catch(() => [] as IState[]),
        profileService.getInfoAboutMe().catch(() => null),
      ]);
      setCurrencies(currRes);
      setStates(statesRes);
      setCurrentUsername(meRes ? meRes.username : null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e?.message || 'Ошибка загрузки валют');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrencies();
  }, []);

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueCurrencyId || !issueAmount || parseFloat(issueAmount) <= 0) {
      alert('Введите корректную сумму эмиссии');
      return;
    }
    try {
      await economyService.issueCurrency(issueCurrencyId, {
        amount: parseFloat(issueAmount),
      });
      setIssueCurrencyId(null);
      setIssueAmount('');
      loadCurrencies();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.message || 'Ошибка эмиссии валюты');
    }
  };

  const content = (
    <div className={embedded ? "economy-page economy-page--embedded" : "economy-page"}>
      {/* Заголовок (только в обычном режиме) */}
      {!embedded && (
        <div className="economy-hero">
          <div>
            <h1 className="hero-title">
              <span>💎</span> Валютный рынок и Эмиссионные центры
            </h1>
            <p className="hero-subtitle">
              Национальные валюты государств, обеспеченные казной, экономикой
              и зачарованными драгоценностями Minecraft
            </p>
          </div>
        </div>
      )}

          {error && (
            <div
              style={{
                marginBottom: '24px',
                padding: '14px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                color: '#fca5a5',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          {/* Формула и пояснение механики курса */}
          <div
            style={{
              background: '#f6f8fa',
              border: '1px solid #d2d2d8',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 'normal',
                  color: '#000000',
                  margin: '0 0 6px',
                  fontFamily: '"Minecraft", sans-serif',
                }}
              >
                ⚡ Как регулируется курс валют?
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: '#535353',
                  margin: 0,
                  lineHeight: 1.6,
                  maxWidth: '700px',
                }}
              >
                В соответствии с экономической формулой, реальный курс
                национальной валюты зависит от{' '}
                <strong style={{ color: '#000000' }}>золотых резервов</strong> в
                казне, <strong style={{ color: '#000000' }}>мощи государства</strong>{' '}
                (число поселений и граждан) и{' '}
                <strong style={{ color: '#000000' }}>общего объема эмиссии</strong>:
              </p>
            </div>
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #d2d2d8',
                borderRadius: '12px',
                padding: '12px 18px',
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#10b981',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              Курс = (Резерв + Мощь) / Эмиссия
            </div>
          </div>

          {loading ? (
            <div className="economy-empty">
              Загрузка валютных котировок...
            </div>
          ) : (
            <div className="economy-grid">
              {currencies.map((cur) => {
                const state = states.find((s) => s.id === cur.stateId);
                const isRuler =
                  Boolean(currentUsername) &&
                  Boolean(state?.leaderUsername) &&
                  state?.leaderUsername?.toLowerCase() ===
                    currentUsername?.toLowerCase();

                return (
                  <CurrencyCard
                    key={cur.id}
                    currency={cur}
                    isRuler={isRuler}
                    onIssueClick={(id) => setIssueCurrencyId(id)}
                  />
                );
              })}
            </div>
          )}

          {/* Модальное окно эмиссии */}
          {issueCurrencyId && (
            <div className="economy-modal-overlay">
              <div className="economy-modal">
                <h3 className="modal-title">Эмиссия денежной массы</h3>
                <form onSubmit={handleIssueSubmit} className="modal-form">
                  <label>
                    <span>Дополнительный выпуск (шт.)</span>
                    <input
                      type="number"
                      step="1"
                      required
                      value={issueAmount}
                      onChange={(e) => setIssueAmount(e.target.value)}
                      placeholder="1000"
                      style={{ fontFamily: 'monospace' }}
                    />
                  </label>
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      margin: '4px 0 0',
                    }}
                  >
                    Внимание: увеличение объема эмиссии без пополнения золотых
                    резервов снижает курс валюты!
                  </p>

                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={() => setIssueCurrencyId(null)}
                      className="economy-btn economy-btn--secondary"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="economy-btn economy-btn--primary"
                    >
                      Выпустить в обращение
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
    </div>
  );

  return embedded ? (
    content
  ) : (
    <div className="page">
      <Sidebar />
      <main className="content">{content}</main>
    </div>
  );
};

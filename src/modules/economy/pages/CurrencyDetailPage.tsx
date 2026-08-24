import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ICurrency } from '../types/economy.types';
import { economyService } from '../services/economy.service';
import Sidebar from '../../../shared/ui/sidebar/sidebar.component';
import { TradingChart } from '../components/TradingChart';
import { getMinecraftItemInfo, getMinecraftEnchantInfo } from '../constants/minecraft-items';
import './CompanyDetailPage.scss'; // Reuse styles or create new ones if needed

export const CurrencyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currency, setCurrency] = useState<ICurrency | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    economyService.getCurrencyById(id)
      .then(res => setCurrency(res))
      .catch(err => {
        console.error(err);
        alert('Ошибка при загрузке валюты');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page">
        <Sidebar />
        <main className="content">
          <div className="company-detail-page">
            <div className="loading">Загрузка данных о валюте...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!currency) {
    return (
      <div className="page">
        <Sidebar />
        <main className="content">
          <div className="company-detail-page">
            <div className="not-found">
              <h2>Валюта не найдена</h2>
              <button className="economy-btn economy-btn--primary" onClick={() => navigate('/economy?tab=currencies')}>
                Вернуться к списку
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const isPositive = currency.rateChange24h >= 0;

  return (
    <div className="page">
      <Sidebar />
      <main className="content">
        <div className="company-detail-page">
          <button 
            className="back-btn" 
            onClick={() => navigate(-1)}
            style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', color: '#475569', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s' }}
          >
            &larr; Назад к списку
          </button>
          
          <div className="cdp-header-card" style={{ marginBottom: '24px' }}>
            <div className="cdp-header-card__main">
              <div className="cdp-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: '#0f172a', background: '#f8fafc' }}>
                {currency.code}
              </div>
              <div className="cdp-title-info">
                <h1 style={{ margin: 0 }}>{currency.name}</h1>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', color: '#64748b' }}>
                  <span>Тикер: {currency.code}</span>
                  <span>В обращении: {currency.totalIssued.toLocaleString('ru-RU')}</span>
                  <span>Золотой резерв: {currency.reserves.toLocaleString('ru-RU')} ед.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="cdp-tab-content">
            <div className="cdp-overview">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
                <div className="cdp-info-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>График курса (относительно эталона)</h2>
                  <div style={{ marginBottom: '16px', fontSize: '24px', fontWeight: 'bold' }}>
                    1 {currency.code} = {currency.exchangeRate.toFixed(4)} ед.
                    <span style={{ fontSize: '14px', marginLeft: '12px', fontWeight: 600, color: isPositive ? '#059669' : '#dc2626' }}>
                      {isPositive ? '+' : ''}{currency.rateChange24h.toFixed(2)}% (24ч)
                    </span>
                  </div>
                  <TradingChart 
                    fetchHistory={() => economyService.getCurrencyRateHistory(currency.id)} 
                    triggerRefetch={currency.exchangeRate} 
                    lineColor="#10b981"
                    topColor="#10b981"
                    bottomColor="rgba(16, 185, 129, 0.05)"
                  />
                </div>

                <div className="cdp-info-card">
                  <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>Обеспечение</h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {(() => {
                      const mainInfo = getMinecraftItemInfo(currency.minecraftItemId);
                      return (
                        <div>
                          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Основная купюра:</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                            {mainInfo?.icon} {mainInfo?.name || currency.minecraftItemId}
                          </div>
                        </div>
                      );
                    })()}

                    {currency.kopeckItemId && (() => {
                      const kopInfo = getMinecraftItemInfo(currency.kopeckItemId);
                      return (
                        <div>
                          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Разменная монета (1/100):</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                            {kopInfo?.icon} {kopInfo?.name || currency.kopeckItemId}
                          </div>
                        </div>
                      );
                    })()}

                    {currency.minecraftEnchantment && (() => {
                      const enchInfo = getMinecraftEnchantInfo(currency.minecraftEnchantment);
                      return (
                        <div>
                          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Чары защиты:</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, color: '#7c3aed' }}>
                            {enchInfo?.icon || '✨'} {enchInfo?.name || currency.minecraftEnchantment}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

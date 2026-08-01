import React, { useEffect, useState } from 'react';
import { ICompany, ICompanyShare } from '../types/economy.types';
import { economyService } from '../services/economy.service';
import { CompanyCard } from '../components/CompanyCard';
import { PortfolioItem } from '../components/PortfolioItem';

export const StockExchangePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'market' | 'portfolio'>('market');
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [portfolio, setPortfolio] = useState<ICompanyShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Модальные окна покупки/продажи
  const [buyCompanyId, setBuyCompanyId] = useState<string | null>(null);
  const [sellCompanyId, setSellCompanyId] = useState<string | null>(null);
  const [sharesCount, setSharesCount] = useState('10');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [compRes, portRes] = await Promise.all([
        economyService.getPublicCompanies(),
        economyService.getMyPortfolio(),
      ]);
      setCompanies(compRes);
      setPortfolio(portRes);
    } catch (e: any) {
      setError(e?.message || 'Ошибка загрузки биржевых данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBuySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyCompanyId || !sharesCount || parseInt(sharesCount, 10) <= 0) return;
    try {
      await economyService.buyShares(buyCompanyId, {
        count: parseInt(sharesCount, 10),
      });
      setBuyCompanyId(null);
      setSharesCount('10');
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Ошибка покупки акций');
    }
  };

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellCompanyId || !sharesCount || parseInt(sharesCount, 10) <= 0) return;
    try {
      await economyService.sellShares(sellCompanyId, {
        count: parseInt(sharesCount, 10),
      });
      setSellCompanyId(null);
      setSharesCount('10');
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Ошибка продажи акций');
    }
  };

  // Расчет общей стоимости портфеля
  const totalPortfolioValue = portfolio.reduce((acc, item) => {
    const comp = companies.find((c) => c.id === item.companyId);
    const price = comp?.sharePrice || item.boughtAtPrice;
    return acc + item.sharesCount * price;
  }, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span className="text-emerald-400">📈</span> Фондовая Биржа и
              Инвестиции
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Торговля акциями публичных компаний, котировки и выплата
              дивидендов
            </p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2 text-right">
            <div className="text-xs text-slate-400">Стоимость портфеля</div>
            <div className="text-xl font-extrabold text-amber-300 font-mono">
              {totalPortfolioValue.toLocaleString('ru-RU')} AR
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Вкладки */}
        <div className="flex border-b border-slate-800 mb-8">
          <button
            onClick={() => setActiveTab('market')}
            className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'market'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            Торговый зал (Рынок)
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'portfolio'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            Мой портфель акционера ({portfolio.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">
            Загрузка котировок...
          </div>
        ) : activeTab === 'market' ? (
          <div>
            {companies.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                На бирже пока нет публичных компаний. Владельцы фирм могут
                провести IPO!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((company) => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    onBuyClick={(id) => setBuyCompanyId(id)}
                    onSellClick={(id) => setSellCompanyId(id)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {portfolio.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                Ваш инвестиционный портфель пуст. Купите акции на рынке, чтобы
                получать дивиденды!
              </div>
            ) : (
              portfolio.map((item) => (
                <PortfolioItem
                  key={item.id}
                  share={item}
                  company={companies.find((c) => c.id === item.companyId)}
                  onSellClick={(id) => setSellCompanyId(id)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Модальное окно покупки акций */}
      {buyCompanyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Покупка акций</h3>
            <form onSubmit={handleBuySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Количество акций (шт.)
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  value={sharesCount}
                  onChange={(e) => setSharesCount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  При активной скупке акций курс компании на бирже автоматически
                  растет.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBuyCompanyId(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                >
                  Купить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно продажи акций */}
      {sellCompanyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              Продажа акций с биржи
            </h3>
            <form onSubmit={handleSellSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Количество акций для продажи (шт.)
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  value={sharesCount}
                  onChange={(e) => setSharesCount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Средства будут зачислены на ваш личный счет в валюте AR.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSellCompanyId(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-red-600 to-rose-600 text-white"
                >
                  Продать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

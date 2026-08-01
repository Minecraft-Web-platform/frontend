import React, { useEffect, useState } from 'react';
import { ICompany } from '../types/economy.types';
import { economyService } from '../services/economy.service';
import { CompanyCard } from '../components/CompanyCard';

export const CompaniesListPage: React.FC = () => {
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Модальное окно создания компании
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [cityId, setCityId] = useState('');
  const [stateId, setStateId] = useState('');

  // Модальное окно IPO
  const [ipoCompanyId, setIpoCompanyId] = useState<string | null>(null);
  const [totalShares, setTotalShares] = useState('1000');
  const [initialPrice, setInitialPrice] = useState('10.0');

  // Модальное окно дивидендов
  const [divCompanyId, setDivCompanyId] = useState<string | null>(null);
  const [divAmount, setDivAmount] = useState('');

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await economyService.getAllCompanies();
      setCompanies(res);
    } catch (e: any) {
      setError(e?.message || 'Ошибка загрузки фирм');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Введите название компании');
      return;
    }
    try {
      await economyService.createCompany({
        name,
        description,
        logoUrl: logoUrl || undefined,
        cityId: cityId || undefined,
        stateId: stateId || undefined,
      });
      setShowCreateModal(false);
      setName('');
      setDescription('');
      setLogoUrl('');
      setCityId('');
      setStateId('');
      loadCompanies();
    } catch (err: any) {
      alert(err?.message || 'Ошибка регистрации компании');
    }
  };

  const handleIpoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipoCompanyId) return;
    try {
      await economyService.conductIPO(ipoCompanyId, {
        totalShares: parseInt(totalShares, 10),
        initialPrice: parseFloat(initialPrice),
      });
      setIpoCompanyId(null);
      loadCompanies();
    } catch (err: any) {
      alert(err?.message || 'Ошибка вывода на биржу (IPO)');
    }
  };

  const handleDividendsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!divCompanyId || !divAmount || parseFloat(divAmount) <= 0) return;
    try {
      const res = await economyService.payDividends(divCompanyId, {
        totalAmount: parseFloat(divAmount),
      });
      alert(
        `Дивиденды в размере ${res.distributed} AR успешно распределены между ${res.shareholdersCount} акционерами!`,
      );
      setDivCompanyId(null);
      setDivAmount('');
      loadCompanies();
    } catch (err: any) {
      alert(err?.message || 'Ошибка выплаты дивидендов');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span className="text-purple-400">🏢</span> Реестр Коммерческих
              Фирм
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Регистрация бизнеса с привязкой к юрисдикции городов/государств и
              коммерческим счетам
            </p>
          </div>
          <div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-purple-500/20"
            >
              + Зарегистрировать фирму
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-slate-400">
            Загрузка каталога компаний...
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
            В реестре пока нет зарегистрированных фирм. Создайте первую!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                isOwner={true} // Для демонстрации владельческих кнопок IPO и Дивидендов
                onIpoClick={(id) => setIpoCompanyId(id)}
                onDividendsClick={(id) => setDivCompanyId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно регистрации фирмы */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              Регистрация новой фирмы
            </h3>
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Название фирмы
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Redstone Dynamics, Craft Corp..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Описание деятельности
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Добыча редстоуна и строительство автоматизированных ферм..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  URL логотипа (опционально)
                </label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    ID Города
                  </label>
                  <input
                    type="text"
                    value={cityId}
                    onChange={(e) => setCityId(e.target.value)}
                    placeholder="UUID Города"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    ID Государства
                  </label>
                  <input
                    type="text"
                    value={stateId}
                    onChange={(e) => setStateId(e.target.value)}
                    placeholder="UUID Государства"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                >
                  Зарегистрировать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно IPO */}
      {ipoCompanyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              Первичное публичное размещение (IPO)
            </h3>
            <form onSubmit={handleIpoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Общее число выпускаемых акций
                </label>
                <input
                  type="number"
                  step="100"
                  required
                  value={totalShares}
                  onChange={(e) => setTotalShares(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Стартовая цена одной акции (AR)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={initialPrice}
                  onChange={(e) => setInitialPrice(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIpoCompanyId(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                >
                  Выпустить на биржу
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно выплаты дивидендов */}
      {divCompanyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              Выплата дивидендов акционерам
            </h3>
            <form onSubmit={handleDividendsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Общая сумма для распределения (AR)
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  value={divAmount}
                  onChange={(e) => setDivAmount(e.target.value)}
                  placeholder="500"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Сумма будет списана со счета компании и разделена между всеми
                  инвесторами пропорционально их доле акций.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDivCompanyId(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                >
                  Выплатить дивиденды
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

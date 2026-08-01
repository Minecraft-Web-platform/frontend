import React, { useEffect, useState } from 'react';
import { ICurrency } from '../types/economy.types';
import { economyService } from '../services/economy.service';
import { CurrencyCard } from '../components/CurrencyCard';

export const CurrenciesPage: React.FC = () => {
  const [currencies, setCurrencies] = useState<ICurrency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Модальное окно создания валюты
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [itemId, setItemId] = useState('minecraft:diamond');
  const [enchantment, setEnchantment] = useState('unbreaking:3');
  const [stateId, setStateId] = useState('');

  // Модальное окно эмиссии
  const [issueCurrencyId, setIssueCurrencyId] = useState<string | null>(null);
  const [issueAmount, setIssueAmount] = useState('');

  const loadCurrencies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await economyService.getAllCurrencies();
      setCurrencies(res);
    } catch (e: any) {
      setError(e?.message || 'Ошибка загрузки валют');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrencies();
  }, []);

  const handleCreateCurrency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) {
      alert('Заполните тикер и название валюты');
      return;
    }
    try {
      await economyService.createCurrency({
        code,
        name,
        minecraftItemId: itemId,
        minecraftEnchantment: enchantment,
        stateId: stateId || undefined,
      });
      setShowCreateModal(false);
      setCode('');
      setName('');
      setStateId('');
      loadCurrencies();
    } catch (err: any) {
      alert(err?.message || 'Ошибка создания валюты');
    }
  };

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
    } catch (err: any) {
      alert(err?.message || 'Ошибка эмиссии валюты');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span className="text-cyan-400">💎</span> Валютный рынок и
              Эмиссионные центры
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Национальные валюты государств, обеспеченные казной, экономикой и
              зачарованными драгоценностями Minecraft
            </p>
          </div>
          <div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20"
            >
              + Создать национальную валюту
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Формула и пояснение механики курса */}
        <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-blue-950/40 border border-cyan-500/20 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-cyan-300">
                ⚡ Как регулируется курс валют?
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                В соответствии с экономической формулой, реальный курс
                национальной валюты зависит от{' '}
                <strong className="text-white">золотых резервов</strong> в
                казне, <strong className="text-white">мощи государства</strong>{' '}
                (число городов и граждан) и{' '}
                <strong className="text-white">общего объема эмиссии</strong>:
              </p>
            </div>
            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3 px-4 text-xs font-mono text-cyan-300 whitespace-nowrap">
              Курс = (Резерв + Мощь) / Эмиссия
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">
            Загрузка валютных котировок...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currencies.map((cur) => (
              <CurrencyCard
                key={cur.id}
                currency={cur}
                isRuler={true} // для демонстрации отображаем кнопку эмиссии правителям
                onIssueClick={(id) => setIssueCurrencyId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно создания валюты */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              Регистрация национальной валюты
            </h3>
            <form onSubmit={handleCreateCurrency} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Тикер (3-4 символа)
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="DIA, GLD, IMP..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Название валюты
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Имперский алмаз, Золотой алтын..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Предмет в Minecraft (Креатив)
                </label>
                <input
                  type="text"
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value)}
                  placeholder="minecraft:diamond"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Уникальные чары
                </label>
                <input
                  type="text"
                  value={enchantment}
                  onChange={(e) => setEnchantment(e.target.value)}
                  placeholder="unbreaking:3 / mending:1"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  ID Государства (опционально)
                </label>
                <input
                  type="text"
                  value={stateId}
                  onChange={(e) => setStateId(e.target.value)}
                  placeholder="UUID государства-эмитента"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
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
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно эмиссии */}
      {issueCurrencyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              Эмиссия денежной массы
            </h3>
            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Дополнительный выпуск (шт.)
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  value={issueAmount}
                  onChange={(e) => setIssueAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Внимание: увеличение объема эмиссии без пополнения золотых
                  резервов снижает курс валюты!
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIssueCurrencyId(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
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
};

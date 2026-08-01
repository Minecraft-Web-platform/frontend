import React, { useEffect, useState } from 'react';
import {
  AccountType,
  IAccount,
  ICard,
  ITransfer,
} from '../types/economy.types';
import { economyService } from '../services/economy.service';
import { AccountCard } from '../components/AccountCard';

export const BankPage: React.FC = () => {
  const [accounts, setAccounts] = useState<IAccount[]>([]);
  const [cards, setCards] = useState<ICard[]>([]);
  const [transfers, setTransfers] = useState<ITransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Модальные окна
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [newAccType, setNewAccType] = useState<AccountType>('personal');
  const [newAccCurrency, setNewAccCurrency] = useState('AR');

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDesc, setTransferDesc] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [accRes, transRes] = await Promise.all([
        economyService.getMyAccounts(),
        economyService.getMyTransfers(),
      ]);
      setAccounts(accRes.accounts);
      setCards(accRes.cards);
      setTransfers(transRes);
      if (accRes.accounts.length > 0 && !transferFrom) {
        setTransferFrom(accRes.accounts[0].accountNumber);
      }
    } catch (e: any) {
      setError(e?.message || 'Ошибка загрузки банковских данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await economyService.createAccount({
        type: newAccType,
        currencyCode: newAccCurrency,
      });
      setShowCreateAccount(false);
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Ошибка открытия счета');
    }
  };

  const handleIssueCard = async (accountId: string) => {
    try {
      await economyService.issueCard({ accountId });
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Ошибка выпуска карты');
    }
  };

  const handleTransferClick = (fromNum: string) => {
    setTransferFrom(fromNum);
    setShowTransferModal(true);
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(transferAmount);
    if (!transferTo || !amountNum || amountNum <= 0) {
      alert('Пожалуйста, введите корректные данные для перевода');
      return;
    }
    try {
      await economyService.transferMoney({
        fromNumber: transferFrom,
        toNumber: transferTo,
        amount: amountNum,
        description: transferDesc,
      });
      setShowTransferModal(false);
      setTransferTo('');
      setTransferAmount('');
      setTransferDesc('');
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Ошибка перевода средств');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок страницы */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span className="text-amber-500">🏦</span> Национальная Банковская
              Система
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Управление счетами, пластиковыми картами и международными
              переводами с учетом налоговых юрисдикций
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowTransferModal(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/10"
            >
              Новый перевод
            </button>
            <button
              onClick={() => setShowCreateAccount(true)}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all border border-slate-700"
            >
              + Открыть счет
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
            Загрузка банковских данных...
          </div>
        ) : (
          <>
            {/* Список счетов */}
            <div className="mb-12">
              <h2 className="text-xl font-bold text-white mb-4">Мои счета</h2>
              {accounts.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                  У вас пока нет открытых счетов. Нажмите «+ Открыть счет» для
                  начала.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {accounts.map((account) => (
                    <AccountCard
                      key={account.id}
                      account={account}
                      cards={cards.filter((c) => c.accountId === account.id)}
                      onIssueCard={handleIssueCard}
                      onTransferClick={handleTransferClick}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* История переводов */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                История переводов и налогов
              </h2>
              {transfers.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
                  История транзакций пуста
                </div>
              ) : (
                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/60 text-xs font-semibold uppercase text-slate-400">
                          <th className="py-3.5 px-4">Дата</th>
                          <th className="py-3.5 px-4">Отправитель</th>
                          <th className="py-3.5 px-4">Получатель</th>
                          <th className="py-3.5 px-4">Описание</th>
                          <th className="py-3.5 px-4 text-right">Налог в казну</th>
                          <th className="py-3.5 px-4 text-right">Сумма</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-sm">
                        {transfers.map((t) => (
                          <tr
                            key={t.id}
                            className="hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-3.5 px-4 text-slate-400 text-xs">
                              {new Date(t.createdAt).toLocaleString('ru-RU')}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-300">
                              {t.fromAccountNumber}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-300">
                              {t.toAccountNumber}
                            </td>
                            <td className="py-3.5 px-4 text-slate-300">
                              {t.description || '—'}
                            </td>
                            <td className="py-3.5 px-4 text-right text-amber-400 font-mono">
                              {t.taxAmount > 0
                                ? `${t.taxAmount.toFixed(2)} ${t.currencyCode}`
                                : '0.00'}
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-white font-mono">
                              {t.amount.toLocaleString('ru-RU')}{' '}
                              <span className="text-amber-400">
                                {t.currencyCode}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Модальное окно открытия счета */}
      {showCreateAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              Открытие банковского счета
            </h3>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Тип счета
                </label>
                <select
                  value={newAccType}
                  onChange={(e) =>
                    setNewAccType(e.target.value as AccountType)
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="personal">Личный счет</option>
                  <option value="company">Коммерческий счет</option>
                  <option value="treasury">Казначейский счет</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Валюта счета
                </label>
                <input
                  type="text"
                  value={newAccCurrency}
                  onChange={(e) =>
                    setNewAccCurrency(e.target.value.toUpperCase())
                  }
                  placeholder="AR, DIA, GLD..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateAccount(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950"
                >
                  Открыть счет
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно перевода средств */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              Перевод средств
            </h3>
            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Списать со счета
                </label>
                <select
                  value={transferFrom}
                  onChange={(e) => setTransferFrom(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.accountNumber}>
                      {acc.accountNumber} ({acc.balance} {acc.currencyCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Получатель (Счет / Карта / Никнейм)
                </label>
                <input
                  type="text"
                  required
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  placeholder="40817810... / 1234... / player_nick"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Сумма перевода
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Назначение платежа
                </label>
                <input
                  type="text"
                  value={transferDesc}
                  onChange={(e) => setTransferDesc(e.target.value)}
                  placeholder="Оплата товаров / Подарок..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950"
                >
                  Перевести
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

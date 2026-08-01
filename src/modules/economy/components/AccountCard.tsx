import React from 'react';
import { IAccount, ICard } from '../types/economy.types';

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
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'personal':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'company':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'treasury':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getBadgeLabel = (type: string) => {
    switch (type) {
      case 'personal':
        return 'Личный счет';
      case 'company':
        return 'Коммерческий счет';
      case 'treasury':
        return 'Казначейский счет';
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
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-6 shadow-xl hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span
            className={`text-xs px-3 py-1 rounded-full border font-medium uppercase tracking-wider ${getBadgeColor(
              account.type,
            )}`}
          >
            {getBadgeLabel(account.type)}
          </span>
          <span className="text-sm text-slate-400 font-mono">
            {account.currencyCode}
          </span>
        </div>

        <div className="mb-6">
          <div className="text-sm text-slate-400 mb-1">Баланс</div>
          <div className="text-3xl font-extrabold text-white flex items-baseline gap-2">
            <span>{account.balance.toLocaleString('ru-RU')}</span>
            <span className="text-amber-400 text-lg font-semibold">
              {account.currencyCode}
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-2 font-mono">
            № {formatAccountNumber(account.accountNumber)}
          </div>
        </div>

        {cards.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="text-xs uppercase tracking-wider text-slate-400 mb-3 font-semibold">
              Привязанные карты ({cards.length})
            </div>
            <div className="space-y-2">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-6 bg-gradient-to-r from-amber-500 to-amber-600 rounded flex items-center justify-center text-[10px] font-bold text-slate-950">
                      CARD
                    </div>
                    <div>
                      <div className="text-sm font-mono text-slate-200">
                        {formatCardNumber(card.cardNumber)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Годна до: {card.expiresAt} | CVV: ***
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      card.isBlocked
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {card.isBlocked ? 'Заблокирована' : 'Активна'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
        {onTransferClick && (
          <button
            onClick={() => onTransferClick(account.accountNumber)}
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2 px-4 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/10"
          >
            Перевести
          </button>
        )}
        {onIssueCard && (
          <button
            onClick={() => onIssueCard(account.id)}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2 px-4 rounded-xl text-sm transition-all border border-slate-700"
          >
            Выпустить карту
          </button>
        )}
      </div>
    </div>
  );
};

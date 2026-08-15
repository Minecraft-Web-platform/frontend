import React, { useState, useEffect } from 'react';
import { IAccount } from '../types/economy.types';
import { economyService } from '../services/economy.service';

interface TransferModalProps {
  accounts: IAccount[];
  initialFromAccount?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  accounts,
  initialFromAccount,
  onClose,
  onSuccess,
}) => {
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferComment, setTransferComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialFromAccount) {
      setTransferFrom(initialFromAccount);
    } else if (accounts.length > 0) {
      setTransferFrom(accounts[0].accountNumber);
    }
  }, [accounts, initialFromAccount]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(transferAmount);
    if (!transferTo || !amountNum || amountNum <= 0) {
      alert('Пожалуйста, введите корректные данные для перевода');
      return;
    }
    try {
      setLoading(true);
      await economyService.transferMoney({
        fromNumber: transferFrom,
        toNumber: transferTo,
        amount: amountNum,
        description: transferComment || undefined,
      });
      onSuccess();
    } catch (err: any) {
      alert(err?.message || 'Ошибка перевода средств');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="economy-modal-overlay">
      <div className="economy-modal">
        <h3 className="modal-title">Новый перевод</h3>
        <form onSubmit={handleTransfer} className="modal-form">
          <label>
            <span>Счет отправителя</span>
            <select
              value={transferFrom}
              onChange={(e) => setTransferFrom(e.target.value)}
              disabled={loading}
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.accountNumber}>
                  {acc.accountNumber} ({acc.balance} {acc.currencyCode})
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Номер получателя</span>
            <input
              type="text"
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
              required
              disabled={loading}
            />
          </label>

          <label>
            <span>Сумма</span>
            <input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="0.00"
              required
              disabled={loading}
            />
          </label>

          <label>
            <span>Назначение платежа</span>
            <input
              type="text"
              value={transferComment}
              onChange={(e) => setTransferComment(e.target.value)}
              placeholder="Оплата товаров / Подарок..."
              disabled={loading}
            />
          </label>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="economy-btn economy-btn--secondary"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="economy-btn economy-btn--primary"
              disabled={loading}
            >
              {loading ? 'Обработка...' : 'Перевести'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

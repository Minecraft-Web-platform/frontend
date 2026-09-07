import {  } from 'axios';
import { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './transaction-receipt.modal.scss';

import { ITransfer, ICurrency } from '../../types/economy.types';
import { getMinecraftItemInfo } from '../../constants/minecraft-items';

interface Props {
  transaction: ITransfer;
  currencies: ICurrency[];
  onClose: () => void;
}

export const TransactionReceiptModal: FC<Props> = ({ transaction, currencies, onClose }) => {
  const { t } = useTranslation('economy');
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const currency = currencies.find((c) => c.code === transaction.currencyCode);
  const currencyIcon = getMinecraftItemInfo(currency?.minecraftItemId || 'minecraft:gold_ingot')?.icon;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, fallbackSrc?: string | null) => {
    if (fallbackSrc && e.currentTarget.src !== fallbackSrc) {
      e.currentTarget.src = fallbackSrc;
    } else {
      e.currentTarget.style.display = 'none';
    }
  };

  const handleDownloadPdf = async () => {
    if (!receiptRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(receiptRef.current, { scale: 4, useCORS: true, allowTaint: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`receipt-${transaction.id.substring(0, 8)}.pdf`);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Failed to generate PDF', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '');

  return (
    <div className="receipt-modal-overlay" onClick={onClose}>
      <div className="receipt-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="receipt-modal-close" onClick={onClose}>
          ✕
        </button>
        
        <div className="receipt-wrapper" ref={receiptRef}>
          <div className="receipt-header">
            <h2>{t('transactionReceipt.title')}</h2>
            <p className="receipt-date">{new Date(transaction.createdAt).toLocaleString('ru-RU')}</p>
          </div>
          
          <div className="receipt-body">
            <div className="receipt-row">
              <span className="receipt-label">{t('transactionReceipt.txId')}</span>
              <span className="receipt-value" style={{ fontFamily: 'monospace' }}>{transaction.id}</span>
            </div>
            
            <div className="receipt-divider"></div>
            
            <div className="receipt-row">
              <span className="receipt-label">{t('transactionReceipt.sender')}</span>
              <div className="receipt-user-info">
                <div className="receipt-user-text">
                  <div className="receipt-user-name-wrapper">
                    <span className="receipt-user-name">{transaction.fromOwnerName || t('transactionReceipt.unknown')}</span>
                    {transaction.fromCoatOfArms && (
                      <img 
                        src={`${BACKEND_URL}/proxy/image?url=${encodeURIComponent(transaction.fromCoatOfArms)}`}
                        alt={t('transactionReceipt.coatOfArms')} 
                        className="receipt-coat-of-arms" 
                        crossOrigin="anonymous"
                        onError={(e) => handleImageError(e, transaction.fromFallbackCoatOfArms ? `${BACKEND_URL}/proxy/image?url=${encodeURIComponent(transaction.fromFallbackCoatOfArms)}` : null)}
                      />
                    )}
                  </div>
                  <span className="receipt-value" style={{ fontFamily: 'monospace', fontSize: '12px' }}>{transaction.fromAccountNumber}</span>
                </div>
              </div>
            </div>
            
            <div className="receipt-row">
              <span className="receipt-label">{t('transactionReceipt.receiver')}</span>
              <div className="receipt-user-info">
                <div className="receipt-user-text">
                  <div className="receipt-user-name-wrapper">
                    <span className="receipt-user-name">{transaction.toOwnerName || t('transactionReceipt.unknown')}</span>
                    {transaction.toCoatOfArms && (
                      <img 
                        src={`${BACKEND_URL}/proxy/image?url=${encodeURIComponent(transaction.toCoatOfArms)}`}
                        alt={t('transactionReceipt.coatOfArms')} 
                        className="receipt-coat-of-arms" 
                        crossOrigin="anonymous"
                        onError={(e) => handleImageError(e, transaction.toFallbackCoatOfArms ? `${BACKEND_URL}/proxy/image?url=${encodeURIComponent(transaction.toFallbackCoatOfArms)}` : null)}
                      />
                    )}
                  </div>
                  <span className="receipt-value" style={{ fontFamily: 'monospace', fontSize: '12px' }}>{transaction.toAccountNumber}</span>
                </div>
              </div>
            </div>
            
            <div className="receipt-divider"></div>
            
            <div className="receipt-row">
              <span className="receipt-label">{t('transactionReceipt.transferAmount')}</span>
              <span className="receipt-value receipt-amount" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {transaction.amount} {transaction.currencyCode} {currencyIcon}
              </span>
            </div>
            
            {transaction.taxAmount > 0 && (
              <div className="receipt-row">
                <span className="receipt-label">{t('transactionReceipt.taxWithheld')}</span>
                <span className="receipt-value" style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {transaction.taxAmount} {transaction.currencyCode} {currencyIcon}
                </span>
              </div>
            )}
            
            <div className="receipt-row">
              <span className="receipt-label">{t('transactionReceipt.description')}</span>
              <span className="receipt-value">{transaction.description || '—'}</span>
            </div>
          </div>
          
          <div className="receipt-footer">
            <div className="receipt-stamp">
              {t('transactionReceipt.paidStamp')}
            </div>
            <p>{t('transactionReceipt.footerText')}</p>
          </div>
        </div>
        
        <div className="receipt-actions">
          <button 
            className="receipt-btn receipt-btn--primary"
            onClick={handleDownloadPdf}
            disabled={isGenerating}
          >
            {isGenerating ? t('transactionReceipt.generating') : t('transactionReceipt.downloadPdf')}
          </button>
        </div>
      </div>
    </div>
  );
};

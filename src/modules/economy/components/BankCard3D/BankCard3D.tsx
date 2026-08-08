import React, { useState, useRef } from 'react';
import { ICard, IAccount } from '../../types/economy.types';
import { getMinecraftItemInfo } from '../../constants/minecraft-items';
import './BankCard3D.scss';

interface BankCard3DProps {
  card: ICard;
  account?: IAccount;
  disableRotation?: boolean;
}

export const BankCard3D: React.FC<BankCard3DProps> = ({ card, account, disableRotation = false }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  const formatCardNumberFull = (num: string) => {
    if (!num) return '';
    return num.match(/.{1,4}/g)?.join('  ') || num;
  };
  
  const handlePointerDown = (e: React.PointerEvent) => {
    if (disableRotation) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };
  
  const handlePointerMove = (e: React.PointerEvent) => {
    if (disableRotation || !isDragging) return;
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    
    // Sensitivity factor
    const sensitivity = 0.6;
    
    setRotY((prev) => prev + deltaX * sensitivity);
    setRotX((prev) => prev - deltaY * sensitivity);
    
    setStartPos({ x: e.clientX, y: e.clientY });
  };
  
  const handlePointerUp = (e: React.PointerEvent) => {
    if (disableRotation) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    
    // Snap to front or back to keep it neat
    const normalizedY = ((rotY % 360) + 360) % 360; 
    let targetY = 0;
    if (normalizedY > 90 && normalizedY <= 270) {
      targetY = 180;
    }
    
    const currentRevs = Math.floor(rotY / 360);
    setRotY(currentRevs * 360 + targetY);
    setRotX(0);
  };
  
  // Resolve item info
  const currencyInfo = getMinecraftItemInfo(card.currencyItemId || '');
  const currencyIcon = currencyInfo ? currencyInfo.icon : null;
  const currencyCode = account ? account.currencyCode : '';
  const bankName = card.bankName || 'НАЦИОНАЛЬНЫЙ БАНК';
  const holderName = account ? account.ownerUsername : 'СЕРВЕРНЫЙ ГРАЖДАНИН';
  
  const companyName = card.companyName || '';
  
  return (
    <div 
      className={`bank-card-3d-wrapper ${disableRotation ? 'no-rotate' : ''}`}
    >
      {!disableRotation && <div className="drag-hint">Потяните, чтобы вращать</div>}
      <div 
        ref={cardRef}
        className={`bank-card-3d ${isDragging ? 'dragging' : ''} ${card.isBlocked ? 'blocked' : ''}`}
        style={{
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* FRONT */}
        <div className="card-face card-front" style={{ backgroundImage: card.backgroundImageUrl ? `url(${card.backgroundImageUrl})` : undefined }}>
          {card.isBlocked && <div className="blocked-overlay">ЗАБЛОКИРОВАНА</div>}
          
          <div className="card-front-top">
            <div className="bank-name">{bankName.toUpperCase()}</div>
            <div className="currency-badge">
              <span className="curr-icon">{currencyIcon}</span>
              <span className="curr-code">{currencyCode}</span>
            </div>
          </div>
          
          <div className="chip-row">
            <div className="card-chip"></div>
            <div className="card-waves">)))</div>
          </div>
          
          <div className="card-number">
            {formatCardNumberFull(card.cardNumber)}
          </div>
          
          <div className="card-front-bottom">
            <div className="holder-section">
              <div className="holder-name">{holderName.toUpperCase()}</div>
              {companyName && <div className="company-name">{companyName.toUpperCase()}</div>}
            </div>
            
            <div className="expiry-section">
              <div className="label">ГОДЕН ДО</div>
              <div className="val">{card.expiresAt}</div>
            </div>
          </div>
        </div>
        
        {/* THICKNESS LAYERS */}
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={`layer-${i}`} className="card-face card-layer" style={{ transform: `translateZ(-${i}px)` }}></div>
        ))}
        
        {/* BACK */}
        <div className="card-face card-back" style={{ transform: `translateZ(-8px) rotateY(180deg)`, backgroundImage: card.backgroundImageUrl ? `url(${card.backgroundImageUrl})` : undefined }}>
          {card.isBlocked && <div className="blocked-overlay">ЗАБЛОКИРОВАНА</div>}
          <div className="mag-stripe"></div>
          
          <div className="back-middle">
            <div className="signature-panel">
              <div className="signature-pattern">
                <span className="signature-text">{holderName}</span>
              </div>
              <div className="cvv-box">{card.cvv}</div>
            </div>
            <div className="auth-text">Подпись владельца</div>
          </div>
          
          <div className="fine-print">
            Эта карта является собственностью {bankName}. При нахождении просьба вернуть в ближайшее отделение.
            Использование этой карты регулируется условиями договора с держателем карты.
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { economyService } from '../services/economy.service';
import { ImageUploader } from '../../../shared/ui/image-uploader/ImageUploader';
import { IState, ISettlement } from '../../states';

interface CreateCompanyModalProps {
  statesList: IState[];
  settlementsList: ISettlement[];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  currenciesList: any[]; // Or ICurrency[] if passed correctly
  myStateId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateCompanyModal: React.FC<CreateCompanyModalProps> = ({
  statesList,
  settlementsList,
  currenciesList,
  myStateId,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation('economy');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [settlementId, setSettlementId] = useState('');
  const [stateId, setStateId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert(t('companies.createModal.nameRequiredAlert'));
      return;
    }
    try {
      setLoading(true);
      await economyService.createCompany({
        name,
        description,
        logoUrl: logoUrl || undefined,
        settlementId: settlementId || undefined,
        stateId: stateId || undefined,
      });
      onSuccess();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || t('companies.createModal.error');
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedStateHasBank =
    !stateId ||
    currenciesList.some(
      (cur) => cur.stateId === stateId || cur.stateId === null,
    );

  return (
    <div className="economy-modal-overlay">
      <div className="economy-modal">
        <h3 className="modal-title">{t('companies.createModal.title')}</h3>
        <form onSubmit={handleCreateCompany} className="modal-form">
          <label>
            <span>{t('companies.createModal.name')}</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('companies.createModal.namePlaceholder')}
              disabled={loading}
            />
          </label>

          <label>
            <span>{t('companies.createModal.desc')}</span>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('companies.createModal.descPlaceholder')}
              disabled={loading}
            />
          </label>

          <ImageUploader 
            folder="economy/companies"
            label={t('companies.createModal.logo')}
            value={logoUrl}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(url: any) => setLogoUrl(url as string)}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            <label>
              <span>{t('companies.createModal.state')} <span style={{ color: '#e11d48' }}>*</span></span>
              <select
                value={stateId}
                onChange={(e) => {
                  const val = e.target.value;
                  setStateId(val);
                  setSettlementId('');
                }}
                required
                disabled={loading}
              >
                <option value="">{t('companies.createModal.selectState')}</option>
                {statesList.map((st) => {
                  const isForeign = Boolean(myStateId && st.id !== myStateId);
                  return (
                    <option key={st.id} value={st.id}>
                      {st.name} {isForeign ? t('companies.createModal.foreignState') : ''}
                    </option>
                  );
                })}
              </select>
            </label>
            <label>
              <span>{t('companies.createModal.settlement')}</span>
              <select
                value={settlementId}
                onChange={(e) => setSettlementId(e.target.value)}
                disabled={!stateId || loading}
                style={{
                  opacity: !stateId ? 0.6 : 1,
                  cursor: !stateId ? 'not-allowed' : 'pointer',
                }}
              >
                <option value="">
                  {!stateId
                    ? t('companies.createModal.selectStateFirst')
                    : t('companies.createModal.notSelected')}
                </option>
                {settlementsList
                  .filter((c) => c.stateId === stateId)
                  .map((ct) => (
                    <option key={ct.id} value={ct.id}>
                      {ct.name}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          {stateId && (
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                backgroundColor: stateId !== myStateId ? '#eff6ff' : '#f8fafc',
                border: stateId !== myStateId ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '26px' }}>
                {stateId !== myStateId ? '🌐' : '🏛️'}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: stateId !== myStateId ? '#1e40af' : '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span>
                    {t('companies.createModal.jurisdiction', {
                      name: statesList.find((s) => s.id === stateId)?.name || t('companies.createModal.notSelected')
                    })}
                  </span>
                  {stateId !== myStateId && (
                    <span
                      style={{
                        fontSize: '11px',
                        backgroundColor: '#3b82f6',
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontWeight: 700,
                      }}
                    >
                      {t('companies.createModal.foreignBadge')}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: stateId !== myStateId ? '#3b82f6' : '#64748b',
                    marginTop: '4px',
                    lineHeight: '1.4',
                  }}
                >
                  {stateId !== myStateId
                    ? t('companies.createModal.foreignNotice')
                    : t('companies.createModal.domesticNotice')}
                </div>
              </div>
            </div>
          )}

          {!selectedStateHasBank && (
            <div
              style={{
                padding: '14px 16px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                color: '#991b1b',
                fontSize: '14px',
                lineHeight: '1.5',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <span style={{ fontSize: '18px' }}>🏛️</span>
              <div>
                <strong>{t('companies.createModal.noBankTitle')}</strong>
                <div style={{ marginTop: '4px', color: '#b91c1c', fontSize: '13px' }}>
                  {t('companies.createModal.noBankDesc')}
                </div>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="economy-btn economy-btn--secondary"
              disabled={loading}
            >
              {t('companies.createModal.cancel')}
            </button>
            <button
              type="submit"
              className="economy-btn economy-btn--primary"
              disabled={!selectedStateHasBank || loading}
              style={{
                opacity: (!selectedStateHasBank || loading) ? 0.6 : 1,
                cursor: (!selectedStateHasBank || loading) ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? t('companies.createModal.creating') : t('companies.createModal.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

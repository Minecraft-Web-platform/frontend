import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './EditCompanyModal.scss';
import { ICompany } from '../../types/economy.types';
import { ImageUploader } from '../../../../shared/ui/image-uploader/ImageUploader';

interface EditCompanyModalProps {
  company: ICompany;
  onClose: () => void;
  onSave: (data: { name?: string; description?: string; logoUrl?: string }) => Promise<void>;
}

export const EditCompanyModal: React.FC<EditCompanyModalProps> = ({ company, onClose, onSave }) => {
  const { t } = useTranslation('economy');
  const [name, setName] = useState(company.name);
  const [description, setDescription] = useState(company.description || '');
  const [logoUrl, setLogoUrl] = useState(company.logoUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSave({ name, description, logoUrl });
      onClose();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.response?.data?.message || t('companies.editModal.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-company-modal-overlay">
      <div className="edit-company-modal">
        <h2>{t('companies.editModal.title')}</h2>
        {error && <div className="edit-company-modal__error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="edit-company-modal__field">
            <label>{t('companies.editModal.name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="edit-company-modal__field">
            <label>{t('companies.editModal.desc')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="edit-company-modal__field">
            <ImageUploader 
              folder="economy/companies"
              label={t('companies.editModal.logo')}
              value={logoUrl}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(url: any) => setLogoUrl(url as string)}
            />
          </div>
          <div className="edit-company-modal__actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              {t('companies.editModal.cancel')}
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? t('companies.editModal.saving') : t('companies.editModal.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

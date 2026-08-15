import React, { useState } from 'react';
import { economyService } from '../services/economy.service';
import Button from '../../../shared/ui/button/button.component';
import { ImageUploader } from '../../../shared/ui/image-uploader/ImageUploader';
import './CreateServiceModal.scss';

import { ICompanyService } from '../types/economy.types';

interface CreateServiceModalProps {
  companyId: string;
  editService?: ICompanyService;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateServiceModal: React.FC<CreateServiceModalProps> = ({ companyId, editService, onClose, onSuccess }) => {
  const [name, setName] = useState(editService?.name || '');
  const [description, setDescription] = useState(editService?.description || '');
  const [isComposite, setIsComposite] = useState(editService?.isComposite || false);
  const [price, setPrice] = useState<number | ''>(editService?.price ?? '');
  const [photoUrls, setPhotoUrls] = useState<string[]>(editService?.photoUrls || []);
  
  const [subItems, setSubItems] = useState<Array<{ name: string; description: string; price: number | ''; photoUrls: string[] }>>(
    editService?.subItems?.map(i => ({
      name: i.name,
      description: i.description ?? '',
      price: i.price ?? '',
      photoUrls: i.photoUrls || []
    })) || []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddSubItem = () => {
    setSubItems([...subItems, { name: '', description: '', price: 0, photoUrls: [] }]);
  };

  const handleSubItemChange = (index: number, field: string, value: any) => {
    const updated = [...subItems];
    (updated[index] as any)[field] = value;
    setSubItems(updated);
  };

  const handleRemoveSubItem = (index: number) => {
    const updated = [...subItems];
    updated.splice(index, 1);
    setSubItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        name,
        description,
        isComposite,
        price: typeof price === 'number' ? price : (parseFloat(price) || 0),
        photoUrls: photoUrls,
        subItems: isComposite ? subItems.map((item, index) => ({
          name: item.name,
          description: item.description,
          price: typeof item.price === 'number' ? item.price : (parseFloat(item.price) || 0),
          displayOrder: index,
          photoUrls: item.photoUrls,
        })) : undefined
      };

      if (editService) {
        await economyService.updateCompanyService(companyId, editService.id, payload);
      } else {
        await economyService.createCompanyService(companyId, payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || `Ошибка при ${editService ? 'редактировании' : 'создании'} услуги`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="create-service-modal">
        <h2>{editService ? 'Редактировать услугу' : 'Создать новую услугу'}</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название услуги</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Описание</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          </div>

          <div className="form-group">
            <ImageUploader 
              folder="economy/services"
              multiple={true}
              maxFiles={5}
              value={photoUrls}
              onChange={(urls) => setPhotoUrls(urls as string[])}
              label="Фотографии услуги (до 5 шт)"
            />
          </div>
          
          <div className="form-group row">
            <label>
              <input type="checkbox" checked={isComposite} onChange={e => setIsComposite(e.target.checked)} />
              Многосоставная услуга (позволяет клиенту выбирать подуслуги)
            </label>
          </div>

          <div className="form-group">
            <label>{isComposite ? 'Базовая стоимость' : 'Стоимость услуги'}</label>
            <input 
              type="number" 
              min="0" 
              step="0.01" 
              value={price} 
              onChange={e => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} 
              required 
            />
          </div>

          {isComposite && (
            <div className="sub-items-section">
              <h3>Подуслуги</h3>
              {subItems.map((item, idx) => (
                <div key={idx} className="sub-item-box">
                  <div className="form-group">
                    <label>Название подуслуги</label>
                    <input type="text" value={item.name} onChange={e => handleSubItemChange(idx, 'name', e.target.value)} required />
                  </div>
                  <div className="form-group row-group">
                    <div className="flex-1">
                      <label>Стоимость</label>
                      <input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        value={item.price} 
                        onChange={e => handleSubItemChange(idx, 'price', e.target.value === '' ? '' : parseFloat(e.target.value))} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <ImageUploader 
                        folder="economy/services"
                        multiple={true}
                        maxFiles={5}
                        value={item.photoUrls}
                        onChange={(urls) => handleSubItemChange(idx, 'photoUrls', urls as string[])}
                        label="Фото подуслуги (до 5 шт)"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Описание подуслуги</label>
                    <input type="text" value={item.description} onChange={e => handleSubItemChange(idx, 'description', e.target.value)} />
                  </div>
                  {subItems.length > 1 && (
                    <button type="button" className="remove-btn" onClick={() => handleRemoveSubItem(idx)}>Удалить подуслугу</button>
                  )}
                </div>
              ))}
              <Button type="button" callback={handleAddSubItem} secondary={true} style={{ marginTop: '12px' }}>Добавить подуслугу</Button>
            </div>
          )}

          <div className="modal-actions">
            <Button type="button" callback={onClose} secondary={true}>Отмена</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Сохранение...' : (editService ? 'Сохранить изменения' : 'Создать услугу')}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

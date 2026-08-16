import { FC, useState } from 'react';
import useSWR from 'swr';
import Sidebar from '../../../shared/ui/sidebar/sidebar.component';
import Button from '../../../shared/ui/button/button.component';
import Input from '../../../shared/ui/input/input.component';
import { achievementsService } from '../../achievements/services/achievements.service';
import { AchievementRarity } from '../../achievements/types/achievements.types';
import './achievements-admin.page.scss';

export const AchievementsAdminPage: FC = () => {
  const { data: achievements, mutate } = useSWR('achievements', () =>
    achievementsService.getAchievements()
  );

  const rarityWeight: Record<string, number> = {
    legendary: 4,
    epic: 3,
    rare: 2,
    common: 1,
  };

  const sortedAchievements = [...(achievements || [])].sort((a, b) => {
    const wA = rarityWeight[a.rarity || 'common'] || 0;
    const wB = rarityWeight[b.rarity || 'common'] || 0;
    return wB - wA; // Legendary first
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [rarity, setRarity] = useState<AchievementRarity>('common');
  const [triggerEvent, setTriggerEvent] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const [grantUsername, setGrantUsername] = useState('');
  const [grantAchievementId, setGrantAchievementId] = useState('');
  
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    try {
      if (editId) {
        await achievementsService.updateAchievement(editId, {
          title,
          description,
          iconUrl,
          rarity,
          triggerEvent,
        });
        setMessage('Ачивка успешно обновлена!');
      } else {
        await achievementsService.createAchievement({
          title,
          description,
          iconUrl,
          rarity,
          triggerEvent,
        });
        setMessage('Ачивка успешно создана!');
      }
      handleCancelEdit();
      mutate();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Ошибка сохранения ачивки');
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setTitle('');
    setDescription('');
    setIconUrl('');
    setTriggerEvent('');
  };

  const handleEditClick = (a: any) => {
    setEditId(a.id);
    setTitle(a.title);
    setDescription(a.description);
    setIconUrl(a.iconUrl || '');
    setRarity(a.rarity);
    setTriggerEvent(a.triggerEvent || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGrant = async () => {
    try {
      await achievementsService.grantAchievement({
        username: grantUsername,
        achievementId: grantAchievementId,
      });
      setMessage('Ачивка успешно выдана!');
      setGrantUsername('');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Ошибка выдачи ачивки');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Точно удалить эту ачивку?')) return;
    try {
      await achievementsService.deleteAchievement(id);
      setMessage('Удалено');
      mutate();
    } catch (err: any) {
      setMessage('Ошибка удаления');
    }
  };

  return (
    <div className="achievements-admin-page">
      <Sidebar />
      <main className="content">
        <h1>Управление Ачивками (Админ)</h1>
        
        {message && <div style={{ marginBottom: 16, color: '#60a5fa' }}>{message}</div>}

        <div className="admin-grid">
          <div className="panel">
            <h2>{editId ? 'Редактировать Ачивку' : 'Создать Ачивку'}</h2>
            <div className="form">
              <Input placeholder="Название" element="input" type="text" value={title} setValue={setTitle} />
              <Input placeholder="Описание" element="input" type="text" value={description} setValue={setDescription} />
              <Input placeholder="URL Иконки (необязательно)" element="input" type="text" value={iconUrl} setValue={setIconUrl} />
              
              <div className="input-group">
                <label>Редкость</label>
                <select value={rarity} onChange={(e) => setRarity(e.target.value as AchievementRarity)}>
                  <option value="common">Обычная (Common)</option>
                  <option value="rare">Редкая (Rare)</option>
                  <option value="epic">Эпическая (Epic)</option>
                  <option value="legendary">Легендарная (Legendary)</option>
                </select>
              </div>

              <Input placeholder="Событие авто-выдачи (state.created)" element="input" type="text" value={triggerEvent} setValue={setTriggerEvent} />

              <div className="buttons-row" style={{ display: 'flex', gap: '8px' }}>
                <Button callback={handleSave} disabled={!title || !description}>
                  {editId ? 'Сохранить' : 'Создать'}
                </Button>
                {editId && (
                  <Button callback={handleCancelEdit} secondary={true}>Отмена</Button>
                )}
              </div>
            </div>
          </div>

          <div className="panel">
            <h2>Выдать Ачивку Игроку</h2>
            <div className="form">
              <Input placeholder="Никнейм игрока" element="input" type="text" value={grantUsername} setValue={setGrantUsername} />
              <div className="input-group">
                <label>Ачивка</label>
                <select value={grantAchievementId} onChange={(e) => setGrantAchievementId(e.target.value)}>
                  <option value="">-- Выберите ачивку --</option>
                  {sortedAchievements.map((a) => (
                    <option key={a.id} value={a.id}>{a.title} ({a.rarity})</option>
                  ))}
                </select>
              </div>
              <Button callback={handleGrant} disabled={!grantUsername || !grantAchievementId}>Выдать</Button>
            </div>
          </div>
        </div>

        <h2>Список Ачивок</h2>
        <div className="achievements-list">
          {sortedAchievements.map((a) => (
            <div key={a.id} className={`achievement-card rarity-${a.rarity}`}>
              {a.iconUrl && <img src={a.iconUrl} alt={a.title} />}
              <div className="info">
                <h3>{a.title}</h3>
                <p>{a.description}</p>
                <small>Trigger: {a.triggerEvent || 'Ручная выдача'}</small>
              </div>
              <div className="actions" style={{ display: 'flex', gap: '8px' }}>
                <button className="edit-btn" onClick={() => handleEditClick(a)}>Редактировать</button>
                <button className="delete-btn" onClick={() => handleDelete(a.id)}>Удалить</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

import { AxiosError } from 'axios';
import { FC, useState } from 'react';
import useSWR from 'swr';
import { useTranslation } from "react-i18next";
import Sidebar from '../../../shared/ui/sidebar/sidebar.component';
import Button from '../../../shared/ui/button/button.component';
import Input from '../../../shared/ui/input/input.component';
import { achievementsService } from '../../achievements/services/achievements.service';
import { AchievementRarity } from '../../achievements/types/achievements.types';
import './achievements-admin.page.scss';

export const AchievementsAdminPage: FC = () => {
  const { t } = useTranslation("admin");
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
    return wB - wA;
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await achievementsService.updateAchievement(editId, {
          title,
          description,
          iconUrl,
          rarity,
          triggerEvent,
        });
        setMessage(t("alerts.updated"));
      } else {
        await achievementsService.createAchievement({
          title,
          description,
          iconUrl,
          rarity,
          triggerEvent,
        });
        setMessage(t("alerts.created"));
      }
      handleCancelEdit();
      mutate();
    } catch (err: unknown) {
      setMessage((err as AxiosError<{message?: string}>).response?.data?.message || t("alerts.errorSave"));
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setTitle('');
    setDescription('');
    setIconUrl('');
    setTriggerEvent('');
  };

  const handleEditClick = (a: { id: string, title: string, description: string, iconUrl?: string, rarity: import("../../achievements/types/achievements.types").AchievementRarity, triggerEvent?: string }) => {
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
      await achievementsService.grantAchievement({ username: grantUsername, achievementId: grantAchievementId });
      setMessage(t("alerts.granted"));
      setGrantUsername('');
    } catch (err: unknown) {
      setMessage((err as AxiosError<{message?: string}>).response?.data?.message || t("alerts.errorGrant"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("alerts.confirmDelete"))) return;
    try {
      await achievementsService.deleteAchievement(id);
      setMessage(t("alerts.deleted"));
      mutate();
    } catch {
      setMessage(t("alerts.errorDelete"));
    }
  };

  return (
    <div className="achievements-admin-page">
      <Sidebar />
      <main className="achievements-admin-main content">
        <h1>{t("title")}</h1>
        
        {message && <div className="admin-message">{message}</div>}

        <div className="admin-section">
          <div className="admin-card">
            <h2>{editId ? t("form.editTitle") : t("form.createTitle")}</h2>
            <form onSubmit={handleSave} className="admin-form">
              <Input placeholder={t("form.namePlaceholder")} element="input" type="text" value={title} setValue={setTitle} />
              <Input placeholder={t("form.descPlaceholder")} element="input" type="text" value={description} setValue={setDescription} />
              
              <div className="form-group">
                <Input
                  value={iconUrl}
                  setValue={setIconUrl}
                  placeholder=""
                  element="input"
                  label={t("form.iconLabel")}
                />
              </div>
              
              <div className="form-group">
                <label>{t("form.rarityLabel")}</label>
                <select value={rarity} onChange={(e) => setRarity(e.target.value as AchievementRarity)} className="admin-select">
                  <option value="common">{t("form.rarityCommon")}</option>
                  <option value="rare">{t("form.rarityRare")}</option>
                  <option value="epic">{t("form.rarityEpic")}</option>
                  <option value="legendary">{t("form.rarityLegendary")}</option>
                </select>
              </div>

              <Input placeholder={t("form.triggerPlaceholder")} element="input" type="text" value={triggerEvent} setValue={setTriggerEvent} />

              <div className="form-actions">
                <Button disabled={!title || !description || !iconUrl}>
                  {editId ? t("form.saveBtn") : t("form.createBtn")}
                </Button>
                {editId && (
                  <Button callback={handleCancelEdit} secondary={true}>{t("form.cancelBtn")}</Button>
                )}
              </div>
            </form>
          </div>

          <div className="admin-card">
            <h2>{t("grant.title")}</h2>
            <div className="admin-form">
              <Input placeholder={t("grant.usernamePlaceholder")} element="input" type="text" value={grantUsername} setValue={setGrantUsername} />
              <div className="form-group">
                <label>{t("grant.achievementLabel")}</label>
                <select value={grantAchievementId} onChange={(e) => setGrantAchievementId(e.target.value)} className="admin-select">
                  <option value="">{t("grant.selectPlaceholder")}</option>
                  {(achievements || []).map((a) => (
                    <option key={a.id} value={a.id}>{a.title} ({a.rarity})</option>
                  ))}
                </select>
              </div>
              <Button callback={handleGrant} disabled={!grantUsername || !grantAchievementId}>{t("grant.grantBtn")}</Button>
            </div>
          </div>
        </div>

        <h2>{t("list.title")}</h2>
        <div className="achievements-list-admin">
          {sortedAchievements.map((a) => (
            <div key={a.id} className="achievement-admin-item">
              {a.iconUrl && <img src={a.iconUrl} alt={a.title} className="achievement-icon-admin" />}
              <div className="achievement-info-admin">
                <h3>{a.title} <span className={`rarity-badge ${a.rarity}`}>{a.rarity}</span></h3>
                <p>{a.description}</p>
                <small>{t("list.triggerPrefix")} {a.triggerEvent || t("list.manualTrigger")}</small>
              </div>
              <div className="achievement-actions">
                <button className="edit-btn" onClick={() => handleEditClick(a)}>{t("list.editBtn")}</button>
                <button className="delete-btn" onClick={() => handleDelete(a.id)}>{t("list.deleteBtn")}</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

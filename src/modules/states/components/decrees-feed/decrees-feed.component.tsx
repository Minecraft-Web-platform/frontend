import {  } from 'axios';
import { FC, useState } from 'react';
import './decrees-feed.component.scss';
import { IStateDecree } from '../../types/states.types';

interface DecreesFeedProps {
  decrees: IStateDecree[];
  canCreate: boolean;
  onCreateDecree: (title: string, content: string) => Promise<void>;
}

const DecreesFeed: FC<DecreesFeedProps> = ({
  decrees,
  canCreate,
  onCreateDecree,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    try {
      await onCreateDecree(title, content);
      setTitle('');
      setContent('');
      setShowForm(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      alert('Ошибка при публикации указа');
    } finally {
      setLoading(false);
    }
  };

  const sortedDecrees = [...(decrees || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="decrees-feed">
      {canCreate && !showForm && (
        <div className="decrees-feed__actions-bar">
          <button
            className="decrees-feed__create-btn"
            onClick={() => setShowForm(true)}
          >
            <span>✍️</span>
            <span>+ Опубликовать новый указ</span>
          </button>
        </div>
      )}

      {showForm && (
        <form className="decrees-feed__form-card" onSubmit={handleSubmit}>
          <div className="form-card__header">
            <div className="form-card__title-wrap">
              <span className="icon">📜</span>
              <div>
                <div className="title">
                  Создание официального указа государства
                </div>
                <div className="subtitle">
                  Указ будет опубликован в государственной ленте и станет виден
                  всем игрокам
                </div>
              </div>
            </div>
          </div>

          <div className="form-card__body">
            <div className="form-group">
              <label>Заголовок документа *</label>
              <input
                type="text"
                placeholder="Например: Указ №1 «О создании Государственного Банка и эмиссии валюты»"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Текст официального указа *</label>
              <textarea
                placeholder="Изложите полный текст решения, законы, регламенты или объявления для граждан..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-card__footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setShowForm(false)}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Публикация...' : '📜 Опубликовать указ'}
            </button>
          </div>
        </form>
      )}

      {sortedDecrees.length > 0 ? (
        <div className="decrees-feed__list">
          {sortedDecrees.map((decree, idx) => (
            <article key={decree.id} className="decree-document">
              <div className="decree-document__top-bar" />
              <div className="decree-document__header">
                <div className="decree-document__title-area">
                  <span className="decree-badge">
                    📜 УКАЗ #{sortedDecrees.length - idx}
                  </span>
                  <h4 className="decree-title">{decree.title}</h4>
                </div>

                <div className="decree-document__author-pill">
                  <img
                    src={`https://minotar.net/helm/${decree.authorUsername}/28.png`}
                    alt={decree.authorUsername}
                    className="author-avatar"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://minotar.net/helm/MHF_Steve/28.png';
                    }}
                  />
                  <div className="author-info">
                    <span className="author-role">Президент / Автор</span>
                    <strong className="author-name">
                      {decree.authorUsername}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="decree-document__body">
                <div className="decree-content">{decree.content}</div>
              </div>

              <div className="decree-document__footer">
                <div className="seal">
                  <span>🏛️</span>
                  <span>
                    Официальный государственный документ • Удостоверено Лидером
                  </span>
                </div>
                <div className="date">
                  📅 {formatDate(decree.createdAt)}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="decrees-feed__empty-card">
          <div className="empty-icon">📜</div>
          <div className="empty-text">
            <strong>Официальных указов пока нет</strong>
            <span>
              Лидер государства еще не публиковал документы, законы или указы.
            </span>
          </div>
          {canCreate && !showForm && (
            <button
              className="empty-btn"
              onClick={() => setShowForm(true)}
            >
              + Опубликовать первый указ
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DecreesFeed;

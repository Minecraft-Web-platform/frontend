import { FC, useState } from 'react';
import './decrees-feed.component.scss';
import { IStateDecree } from '../../types/states.types';

interface DecreesFeedProps {
  decrees: IStateDecree[];
  canCreate: boolean;
  onCreateDecree: (title: string, content: string) => Promise<void>;
}

const DecreesFeed: FC<DecreesFeedProps> = ({ decrees, canCreate, onCreateDecree }) => {
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
    } catch (err) {
      console.error(err);
      alert('Ошибка при публикации указа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="decrees-feed">
      {canCreate && !showForm && (
        <button
          className="decrees-feed__btn decrees-feed__btn--primary"
          onClick={() => setShowForm(true)}
          style={{ alignSelf: 'flex-start' }}
        >
          📜 Опубликовать новый указ
        </button>
      )}

      {showForm && (
        <form className="decrees-feed__form" onSubmit={handleSubmit}>
          <h4>Новый указ лидера</h4>
          <input
            type="text"
            placeholder="Заголовок указа..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Текст официального указа..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <div className="decrees-feed__buttons">
            <button
              type="button"
              className="decrees-feed__btn decrees-feed__btn--secondary"
              onClick={() => setShowForm(false)}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="decrees-feed__btn decrees-feed__btn--primary"
              disabled={loading}
            >
              {loading ? 'Публикация...' : 'Опубликовать'}
            </button>
          </div>
        </form>
      )}

      {decrees && decrees.length > 0 ? (
        decrees.map((decree) => (
          <div key={decree.id} className="decrees-feed__item">
            <div className="decrees-feed__header">
              <h4 className="decrees-feed__title">{decree.title}</h4>
              <div className="decrees-feed__meta">
                <span className="decrees-feed__author">👑 {decree.authorUsername}</span>
                <span>{new Date(decree.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <p className="decrees-feed__content">{decree.content}</p>
          </div>
        ))
      ) : (
        <div className="decrees-feed__empty">
          Официальных указов пока нет. Лидер государства еще не публиковал документы.
        </div>
      )}
    </div>
  );
};

export default DecreesFeed;

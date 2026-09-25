import React, { useEffect, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../../store/auth.store';
import { IAchievement } from '../../../modules/achievements/types/achievements.types';
import { playAchievementSound } from '../../utils/audio.utils';
import './global-toast.scss';
import { useShallow } from 'zustand/react/shallow';


const SERVER_URL = import.meta.env.VITE_BACKEND_URL;

interface ToastItem {
  id: string;
  achievement: IAchievement;
}

export const GlobalToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation('profile');
  const { accessToken } = useAuthStore(useShallow(state => ({ accessToken: state.accessToken })));
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    if (!accessToken) return;

    let eventSource: EventSource | null = null;

    // Use a small delay to handle React StrictMode double rendering
    // If the component unmounts immediately (as in StrictMode), 
    // we simply cancel the timer and avoid creating aborted requests,
    // which Firefox reports as a CORS error with Status: null.
    const timer = setTimeout(() => {
      eventSource = new EventSource(`${SERVER_URL}/achievements/stream?token=${accessToken}`);

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.achievement) {
            const newToast: ToastItem = {
              id: Date.now().toString(),
              achievement: payload.achievement,
            };
            
            setToasts((prev) => [...prev, newToast]);
            
            playAchievementSound(payload.achievement.rarity);

            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
            }, 10000);
          }
        } catch (err) {
          console.error('Failed to parse SSE data', err);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE Error (will auto-reconnect):', error);
      };
    }, 100);

    return () => {
      clearTimeout(timer);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [accessToken]);

  return (
    <>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => {
          const rarity = toast.achievement.rarity || 'common';
          const rarityLabel = t(`achievements.rarities.${rarity}`, { defaultValue: t('achievements.unlocked') });

          return (
            <div key={toast.id} className={`achievement-toast rarity-${rarity}`}>
              <div className="toast-icon">
                {toast.achievement.iconUrl ? (
                  <img src={toast.achievement.iconUrl} alt="achievement" />
                ) : (
                  <span>🏆</span>
                )}
              </div>
              <div className="toast-content">
                <h4>{rarityLabel}</h4>
                <p>{toast.achievement.title}</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

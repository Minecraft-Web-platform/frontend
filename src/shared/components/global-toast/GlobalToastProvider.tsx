import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import useAuthStore from '../../../store/auth.store';
import { IAchievement } from '../../../modules/achievements/types/achievements.types';
import { playAchievementSound } from '../../utils/audio.utils';
import './global-toast.scss';

const SERVER_URL = import.meta.env.VITE_BACKEND_URL;

interface ToastContextType {}

const ToastContext = createContext<ToastContextType>({});

export const useToast = () => useContext(ToastContext);

interface ToastItem {
  id: string;
  achievement: IAchievement;
}

export const GlobalToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { accessToken } = useAuthStore();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    if (!accessToken) return;

    const eventSource = new EventSource(`${SERVER_URL}/achievements/stream?token=${accessToken}`);

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

    return () => {
      eventSource.close();
    };
  }, [accessToken]);

  return (
    <ToastContext.Provider value={{}}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => {
          const rarity = toast.achievement.rarity || 'common';
          let rarityLabel = 'ДОСТИЖЕНИЕ ПОЛУЧЕНО';
          if (rarity === 'common') rarityLabel = 'ОБЫЧНОЕ ДОСТИЖЕНИЕ';
          if (rarity === 'rare') rarityLabel = 'РЕДКОЕ ДОСТИЖЕНИЕ';
          if (rarity === 'epic') rarityLabel = 'ЭПИЧЕСКОЕ ДОСТИЖЕНИЕ';
          if (rarity === 'legendary') rarityLabel = 'ЛЕГЕНДАРНОЕ ДОСТИЖЕНИЕ';

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
    </ToastContext.Provider>
  );
};

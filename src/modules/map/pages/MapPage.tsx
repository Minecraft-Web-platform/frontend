import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './MapPage.scss';
import Sidebar from '../../../shared/ui/sidebar/sidebar.component';
import { serverService } from '../../../shared/services/server.service';

export const MapPage: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const location = useLocation();
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await serverService.getPing();
        setIsOnline(res.running);
      } catch (e) {
        setIsOnline(false);
      }
    };
    checkStatus();
  }, []);

  const mapUrl = `/bluemap/${location.hash}`; 

  return (
    <div className="page map-root">
      <Sidebar />
      
      <main className="content map-main">
        <div className="map-page-container">
          
          <div className="map-overlay-header">
            <div className="map-title-glass">
              <h1>Карта Мира</h1>
              <p>Живое отображение территорий и игроков</p>
            </div>
          </div>

          <div className="map-wrapper">
            {isOnline === false ? (
              <div className="offline-placeholder" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#fff', background: 'rgba(0,0,0,0.8)' }}>
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '48px', height: '48px', marginBottom: '16px', opacity: 0.5 }}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                 </svg>
                 <h2>Сервер выключен</h2>
                 <p style={{ opacity: 0.7 }}>Карта в данный момент недоступна.</p>
              </div>
            ) : (
              <iframe 
                ref={iframeRef}
                src={mapUrl}
                title="Interactive Map"
                className="map-iframe"
                allowFullScreen
              ></iframe>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
};

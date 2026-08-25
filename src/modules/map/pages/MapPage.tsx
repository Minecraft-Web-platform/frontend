import React, { useRef } from 'react';
import './MapPage.scss';
import Sidebar from '../../../shared/ui/sidebar/sidebar.component';

export const MapPage: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const mapUrl = '/bluemap/'; 

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
            <iframe 
              ref={iframeRef}
              src={mapUrl}
              title="Interactive Map"
              className="map-iframe"
              allowFullScreen
            ></iframe>
          </div>
          
        </div>
      </main>
    </div>
  );
};

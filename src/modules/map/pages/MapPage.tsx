import React, { useEffect, useRef, useState } from 'react';
import './MapPage.scss';
import { ITerritory, IMapProvider } from '../models/map.types';
import { DynmapAdapter } from '../adapters/dynmap.adapter';
import { BlueMapAdapter } from '../adapters/bluemap.adapter';
import Sidebar from '../../../shared/ui/sidebar/sidebar.component';

export const MapPage: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [territories, setTerritories] = useState<ITerritory[]>([]);
  const [adapter, setAdapter] = useState<IMapProvider | null>(null);

  const mapUrl = '/bluemap/'; 

  useEffect(() => {
    const fetchTerritories = async () => {
      try {
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        const res = await fetch(`${BACKEND_URL}/territories`);
        if (res.ok) {
          const data = await res.json();
          setTerritories(data);
        }
      } catch (e) {
        console.error('Failed to fetch territories', e);
      }
    };
    fetchTerritories();
  }, []);

  useEffect(() => {
    setAdapter(new BlueMapAdapter());
  }, []);

  const handleIframeLoad = () => {
    if (iframeRef.current && adapter) {
      adapter.init(iframeRef.current);
      setTimeout(() => {
        adapter.drawTerritories(territories);
      }, 2000);
    }
  };

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
              onLoad={handleIframeLoad}
              allowFullScreen
            ></iframe>
          </div>
          
        </div>
      </main>
    </div>
  );
};

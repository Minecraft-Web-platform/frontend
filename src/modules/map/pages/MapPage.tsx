import React, { useEffect, useRef, useState } from 'react';
import './MapPage.scss';
import { ITerritory, IMapProvider } from '../models/map.types';
import { DynmapAdapter } from '../adapters/dynmap.adapter';
import { BlueMapAdapter } from '../adapters/bluemap.adapter';

export const MapPage: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [territories, setTerritories] = useState<ITerritory[]>([]);
  const [adapter, setAdapter] = useState<IMapProvider | null>(null);
  const [mapType, setMapType] = useState<'dynmap' | 'bluemap'>('bluemap'); // Can be moved to env config

  // Map URLs should ideally come from env config, for example import.meta.env.VITE_MAP_URL
  const mapUrl = mapType === 'dynmap' 
    ? 'http://localhost:8123' // Example dynmap local url
    : '/bluemap/'; // Proxy through Vite to avoid CORS and iframe cross-origin issues

  useEffect(() => {
    // Fetch territories from backend
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
    // Initialize correct adapter based on map type
    let newAdapter: IMapProvider;
    if (mapType === 'dynmap') {
      newAdapter = new DynmapAdapter();
    } else {
      newAdapter = new BlueMapAdapter();
    }
    
    setAdapter(newAdapter);
  }, [mapType]);

  const handleIframeLoad = () => {
    if (iframeRef.current && adapter) {
      adapter.init(iframeRef.current);
      // Give the map a moment to fully initialize its internal objects
      setTimeout(() => {
        adapter.drawTerritories(territories);
      }, 2000);
    }
  };

  return (
    <div className="map-page-container">
      <div className="map-header">
        <h1>Карта Мира</h1>
        <div className="map-controls">
          <label>Тип карты: </label>
          <select value={mapType} onChange={e => setMapType(e.target.value as 'dynmap' | 'bluemap')}>
            <option value="dynmap">Dynmap</option>
            <option value="bluemap">BlueMap</option>
          </select>
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
  );
};

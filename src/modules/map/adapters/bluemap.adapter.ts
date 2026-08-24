import { IMapProvider, ITerritory } from '../models/map.types';

// Helper to generate a consistent color based on a string (State name)
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

// Convert hex color to RGBA array expected by BlueMap
function hexToRgba(hex: string, alpha: number): { r: number, g: number, b: number, a: number } {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b, a: alpha };
}

export class BlueMapAdapter implements IMapProvider {
  private iframe: HTMLIFrameElement | null = null;
  private markerSetId = 'city_territories_layer';

  init(container: HTMLElement): void {
    if (container.tagName.toLowerCase() !== 'iframe') {
      console.error('BlueMapAdapter requires an iframe container');
      return;
    }
    this.iframe = container as HTMLIFrameElement;
  }

  drawTerritories(territories: ITerritory[]): void {
    // Вся отрисовка перенесена на бекенд (live/markers.json proxy). 
    // BlueMap автоматически будет загружать и обновлять этот JSON.
  }
}

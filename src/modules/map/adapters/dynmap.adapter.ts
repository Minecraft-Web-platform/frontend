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

export class DynmapAdapter implements IMapProvider {
  private iframe: HTMLIFrameElement | null = null;
  private drawnLayers: any[] = []; // Store references to drawn Leaflet layers

  init(container: HTMLElement): void {
    // We expect the container to be an iframe for Dynmap
    if (container.tagName.toLowerCase() !== 'iframe') {
      console.error('DynmapAdapter requires an iframe container');
      return;
    }
    this.iframe = container as HTMLIFrameElement;
  }

  clear(): void {
    if (!this.iframe || !this.iframe.contentWindow) return;
    
    try {
      const L = (this.iframe.contentWindow as any).L;
      const dynmap = (this.iframe.contentWindow as any).dynmap;
      
      if (L && dynmap && dynmap.map) {
        this.drawnLayers.forEach(layer => {
          dynmap.map.removeLayer(layer);
        });
        this.drawnLayers = [];
      }
    } catch (e) {
      console.error('Cannot clear Dynmap markers. Check CORS or iframe origin.', e);
    }
  }

  drawTerritories(territories: ITerritory[]): void {
    if (!this.iframe || !this.iframe.contentWindow) return;

    try {
      const cw = this.iframe.contentWindow as any;
      const L = cw.L;
      const dynmap = cw.dynmap;

      if (!L || !dynmap || !dynmap.map) {
        console.warn('Dynmap not fully loaded yet or not found in iframe');
        return;
      }

      this.clear();

      territories.forEach(t => {
        // Dynmap coordinates mapping to Leaflet LatLng depends on the projection.
        // Usually, in flat/surface projections, it's roughly [x, -z] or similar.
        // We will use standard Leaflet rectangle mapping assuming the map uses standard Flat projection.
        // Note: Dynmap projection can be complex (isometric). If it is isometric, drawing exact rectangles via simple Leaflet bounds might not align perfectly without Dynmap's projection functions.
        // We will use dynmap's internal projection utility if possible.
        
        const stateName = t.city.state?.name || 'Независимый город';
        const color = stringToColor(stateName);
        
        const proj = dynmap.maptypes[dynmap.maptype]?.projection;
        let bounds;
        
        if (proj && typeof proj.locationToLatLng === 'function') {
           const p1 = proj.locationToLatLng({x: t.minX, y: 64, z: t.minZ});
           const p2 = proj.locationToLatLng({x: t.maxX, y: 64, z: t.maxZ});
           bounds = [
             [p1.lat, p1.lng],
             [p2.lat, p2.lng]
           ];
        } else {
           // Fallback for 2D flat maps where lat = x, lng = z or similar
           bounds = [[t.minX, t.minZ], [t.maxX, t.maxZ]];
        }

        const rect = L.rectangle(bounds, {
          color: color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.3
        });
        
        rect.bindPopup(`<b>${t.city.name}</b><br>Государство: ${stateName}`);
        rect.addTo(dynmap.map);
        
        this.drawnLayers.push(rect);
      });

    } catch (e) {
      console.error('Cannot draw Dynmap markers. Check CORS or iframe origin.', e);
    }
  }
}

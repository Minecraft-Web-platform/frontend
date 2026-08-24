export interface ITerritory {
  id: string;
  cityId: string;
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
  createdAt: string;
  city: {
    id: string;
    name: string;
    state?: {
      id: string;
      name: string;
    };
  };
}

export interface IMapProvider {
  /**
   * Initializes the map inside the given container element
   */
  init(container: HTMLElement): void;

  /**
   * Clears all drawn territories from the map
   */
  clear(): void;

  /**
   * Draws a list of territories on the map
   */
  drawTerritories(territories: ITerritory[]): void;
}

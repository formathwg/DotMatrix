export interface HalftoneSettings {
  gridSize: number; // Size of the grid cell (pixel spacing)
  minRadius: number;
  maxRadiusScale: number; // Multiplier for grid size (e.g., 0.5 = touches neighbors)
  dotColor: string;
  backgroundColor: string;
  invert: boolean;
  contrast: number; // 1.0 is normal
}

export interface AIAnalysisResult {
  title: string;
  description: string;
  tags: string[];
}

export enum ProcessingState {
  IDLE,
  PROCESSING,
  ANALYZING,
  COMPLETE
}

export type Language = 'en' | 'zh';
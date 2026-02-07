// app/types.ts
export interface Highlight {
  id: string;
  pageNumber: number;
  color: string;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  type: 'box' | 'line';
}

export type HighlightColor = '#FFFF00' | '#00FF00' | '#FF00FF' | '#00FFFF' | '#FFA500';
export type HighlightTool = 'box' | 'line';
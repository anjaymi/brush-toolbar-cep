export interface FavoriteBrush {
  id: string;
  name: string;
  type: 'brush' | 'toolPreset';
  iconKey?: string;
  color?: string;
  toolId?: string;
}

export interface UserTool {
  id: string;
  type: string;
  name: string;
  color?: string;
}

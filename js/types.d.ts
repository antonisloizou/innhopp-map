export interface TechEventMedia {
  type: 'image' | 'video';
  src: string;
  alt: string;
}

export interface TechEvent {
  id: string;
  title: string;
  summary: string;
  detailsHTML: string;
  media?: TechEventMedia[];
  x: number;
  y: number;
  group: string;
  date: string;
  color?: string;
  icon?: string;
}

export interface AppItem {
  id: string;
  name: string;
  description: string;
  url: string;
  category: 'featured' | 'education' | 'tools' | 'explore';
  icon: string; // Lucide icon name or Phosphor icon name
  gradient: string;
  external?: boolean;
  badge?: string;
}

export interface SearchResultItem {
  title: string;
  url: string;
  repo: string;
}

export interface RealtimeAnnouncement {
  id: string;
  title: string;
  info: string;
  date?: string;
  time?: string;
  color?: string;
}

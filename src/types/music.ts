export type RepeatMode = 'off' | 'one' | 'all';

export type Song = {
  id: string;
  uri: string;
  fileName: string;
  title: string;
  artist: string;
  artwork?: string;
  duration?: number;
};

export type Playlist = {
  id: string;
  name: string;
  songIds: string[];
  createdAt: number;
  updatedAt: number;
  source?: 'manual' | 'artist';
  artistKey?: string;
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type Stats = Record<string, { plays: number; lastPlayed: number }>;
type History = { songs: Stats; playlists: Stats };

export const useListeningHistory = create<History>()(
  persist(() => ({ songs: {}, playlists: {} }), {
    name: 'violet-listening-history',
    storage: createJSONStorage(() => AsyncStorage),
    skipHydration: true,
  }),
);

const historyReady = useListeningHistory.persist.rehydrate();

export async function recordListen(songId: string, playlistId?: string) {
  await historyReady;
  const lastPlayed = Date.now();
  function increment(stats: Stats, id: string): Stats {
    return { ...stats, [id]: { plays: (stats[id]?.plays ?? 0) + 1, lastPlayed } };
  }
  useListeningHistory.setState((state) => ({
    songs: increment(state.songs, songId),
    playlists: playlistId ? increment(state.playlists, playlistId) : state.playlists,
  }));
}

export function listeningLists<T extends { id: string }>(items: T[], stats: Stats, limit: number) {
  const played = items.filter((item) => stats[item.id]);
  played.sort((a, b) => stats[b.id].lastPlayed - stats[a.id].lastPlayed);
  const recent = played.slice(0, limit);
  // A stable sort keeps the most recent listen first when play counts tie.
  played.sort((a, b) => stats[b.id].plays - stats[a.id].plays);
  return { recent, top: played.slice(0, limit) };
}

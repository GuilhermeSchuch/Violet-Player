import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { applySongGainDb, DEFAULT_SONG_GAIN_DB, normalizeSongGainDb } from '../services/songGain';

type SongGainState = {
  gainDbBySongId: Record<string, number>;
  getSongGainDb: (songId?: string) => number;
  setSongGainDb: (songId: string, gainDb: number) => Promise<void>;
  applySongGain: (songId?: string) => Promise<void>;
};

export const useSongGainStore = create<SongGainState>()(
  persist(
    (set, get) => ({
      gainDbBySongId: {},
      getSongGainDb(songId) {
        if (!songId) {
          return DEFAULT_SONG_GAIN_DB;
        }

        return get().gainDbBySongId[songId] ?? DEFAULT_SONG_GAIN_DB;
      },
      async setSongGainDb(songId, gainDb) {
        const normalizedGainDb = normalizeSongGainDb(gainDb);

        set((state) => {
          const nextGainDbBySongId = { ...state.gainDbBySongId };

          if (normalizedGainDb === DEFAULT_SONG_GAIN_DB) {
            delete nextGainDbBySongId[songId];
          } else {
            nextGainDbBySongId[songId] = normalizedGainDb;
          }

          return { gainDbBySongId: nextGainDbBySongId };
        });

        await applySongGainDb(normalizedGainDb);
      },
      applySongGain(songId) {
        return applySongGainDb(get().getSongGainDb(songId));
      },
    }),
    {
      name: 'violet-song-gain',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ gainDbBySongId: state.gainDbBySongId }),
    },
  ),
);

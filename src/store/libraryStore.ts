import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { scanMusicFolder } from '../services/libraryScanner';
import { Song } from '../types/music';
import { usePlaylistStore } from './playlistStore';

type LibraryState = {
  folderUri?: string;
  songs: Song[];
  isScanning: boolean;
  hasHydrated: boolean;
  pendingArtistPlaylistNames: string[];
  error?: string;
  setFolder: (folderUri: string) => Promise<void>;
  rescan: () => Promise<void>;
  validateSavedFolder: () => Promise<boolean>;
  confirmArtistPlaylistCreation: () => void;
  dismissArtistPlaylistPrompt: () => void;
  markHydrated: () => void;
  clearError: () => void;
};

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      songs: [],
      isScanning: false,
      hasHydrated: false,
      pendingArtistPlaylistNames: [],
      async setFolder(folderUri) {
        set({ folderUri, isScanning: true, error: undefined, pendingArtistPlaylistNames: [] });
        try {
          const songs = await scanMusicFolder(folderUri);
          usePlaylistStore.getState().syncArtistPlaylists(songs);
          const pendingArtistPlaylistNames = usePlaylistStore.getState().getNewArtistPlaylistNames(songs);
          set({ songs, isScanning: false, pendingArtistPlaylistNames });
        } catch (error) {
          set({
            isScanning: false,
            error: error instanceof Error ? error.message : 'Unable to scan this folder.',
          });
        }
      },
      async rescan() {
        const { folderUri } = get();
        if (!folderUri) {
          set({ error: 'Choose a music folder first.' });
          return;
        }

        set({ isScanning: true, error: undefined });
        try {
          const songs = await scanMusicFolder(folderUri);
          usePlaylistStore.getState().syncArtistPlaylists(songs);
          set({ songs, isScanning: false });
        } catch (error) {
          set({
            isScanning: false,
            error: error instanceof Error ? error.message : 'Unable to scan this folder.',
          });
        }
      },
      async validateSavedFolder() {
        const { folderUri } = get();
        if (!folderUri) {
          return true;
        }

        set({ isScanning: true, error: undefined });
        try {
          const songs = await scanMusicFolder(folderUri);
          usePlaylistStore.getState().syncArtistPlaylists(songs);
          set({ songs, isScanning: false });
          return true;
        } catch {
          usePlaylistStore.getState().syncArtistPlaylists([]);
          set({
            folderUri: undefined,
            songs: [],
            isScanning: false,
            error: undefined,
          });
          return false;
        }
      },
      confirmArtistPlaylistCreation() {
        const { songs, pendingArtistPlaylistNames } = get();
        if (pendingArtistPlaylistNames.length) {
          usePlaylistStore.getState().syncArtistPlaylists(songs, true);
        }
        set({ pendingArtistPlaylistNames: [] });
      },
      dismissArtistPlaylistPrompt() {
        set({ pendingArtistPlaylistNames: [] });
      },
      markHydrated() {
        set({ hasHydrated: true });
      },
      clearError() {
        set({ error: undefined });
      },
    }),
    {
      name: 'violet-library',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ folderUri: state.folderUri }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);

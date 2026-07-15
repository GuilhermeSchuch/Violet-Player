import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Playlist, Song } from '../types/music';
import { makeId } from '../utils/format';

type PlaylistState = {
  playlists: Playlist[];
  createPlaylist: (name: string) => string;
  renamePlaylist: (id: string, name: string) => void;
  deletePlaylist: (id: string) => void;
  addSong: (playlistId: string, songId: string) => void;
  removeSong: (playlistId: string, songId: string) => void;
  syncArtistPlaylists: (songs: Song[]) => void;
};

function normalizeArtistKey(artist: string) {
  return artist.trim().toLocaleLowerCase();
}

function makeArtistPlaylistId(artistKey: string) {
  return `artist:${makeId(artistKey)}`;
}

export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set) => ({
      playlists: [],
      createPlaylist(name) {
        const id = `${Date.now()}`;
        const now = Date.now();
        set((state) => ({
          playlists: [
            ...state.playlists,
            { id, name: name.trim() || 'Untitled Playlist', songIds: [], createdAt: now, updatedAt: now, source: 'manual' },
          ],
        }));
        return id;
      },
      renamePlaylist(id, name) {
        set((state) => ({
          playlists: state.playlists.map((playlist) =>
            playlist.id === id
              ? { ...playlist, name: name.trim() || playlist.name, updatedAt: Date.now() }
              : playlist,
          ),
        }));
      },
      deletePlaylist(id) {
        set((state) => ({ playlists: state.playlists.filter((playlist) => playlist.id !== id) }));
      },
      addSong(playlistId, songId) {
        set((state) => ({
          playlists: state.playlists.map((playlist) =>
            playlist.id === playlistId && !playlist.songIds.includes(songId)
              ? { ...playlist, songIds: [...playlist.songIds, songId], updatedAt: Date.now() }
              : playlist,
          ),
        }));
      },
      removeSong(playlistId, songId) {
        set((state) => ({
          playlists: state.playlists.map((playlist) =>
            playlist.id === playlistId
              ? {
                  ...playlist,
                  songIds: playlist.songIds.filter((id) => id !== songId),
                  updatedAt: Date.now(),
                }
              : playlist,
          ),
        }));
      },
      syncArtistPlaylists(songs) {
        const artistGroups = new Map<string, { name: string; songIds: string[] }>();

        for (const song of songs) {
          const artistKey = normalizeArtistKey(song.artist);

          if (!artistKey || artistKey === 'unknown artist') {
            continue;
          }

          const group = artistGroups.get(artistKey) ?? { name: song.artist.trim(), songIds: [] };
          group.songIds.push(song.id);
          artistGroups.set(artistKey, group);
        }

        for (const [artistKey, group] of artistGroups) {
          if (group.songIds.length < 2) {
            artistGroups.delete(artistKey);
          }
        }

        set((state) => {
          const now = Date.now();
          const nextPlaylists = state.playlists
            .filter((playlist) => playlist.source !== 'artist' || (playlist.artistKey && artistGroups.has(playlist.artistKey)))
            .map((playlist) => {
              if (playlist.source !== 'artist' || !playlist.artistKey) {
                return playlist;
              }

              const artistGroup = artistGroups.get(playlist.artistKey);
              if (!artistGroup) {
                return playlist;
              }

              return {
                ...playlist,
                name: artistGroup.name,
                songIds: artistGroup.songIds,
                updatedAt: now,
              };
            });

          const existingArtistKeys = new Set(
            nextPlaylists.filter((playlist) => playlist.source === 'artist').map((playlist) => playlist.artistKey),
          );

          for (const [artistKey, group] of artistGroups) {
            if (existingArtistKeys.has(artistKey)) {
              continue;
            }

            nextPlaylists.push({
              id: makeArtistPlaylistId(artistKey),
              name: group.name,
              songIds: group.songIds,
              createdAt: now,
              updatedAt: now,
              source: 'artist',
              artistKey,
            });
          }

          return { playlists: nextPlaylists };
        });
      },
    }),
    {
      name: 'violet-playlists',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

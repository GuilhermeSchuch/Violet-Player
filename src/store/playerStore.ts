import { create } from 'zustand';
import TrackPlayer, { State, usePlaybackState, useProgress } from 'react-native-track-player';

import { loadQueue, setNativeRepeatMode } from '../services/player';
import { RepeatMode, Song } from '../types/music';
import { useSongGainStore } from './songGainStore';

type PlayerState = {
  queue: Song[];
  currentSong?: Song;
  currentIndex: number;
  shuffle: boolean;
  repeatMode: RepeatMode;
  playSongs: (songs: Song[], startIndex?: number) => Promise<void>;
  playShuffledSongs: (songs: Song[]) => Promise<void>;
  togglePlay: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setCurrentIndex: (index?: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => Promise<void>;
};

function shuffled<T>(items: T[]) {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]];
  }

  return nextItems;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: -1,
  shuffle: false,
  repeatMode: 'off',
  async playSongs(songs, startIndex = 0) {
    const queue = get().shuffle ? shuffled(songs) : songs;
    const startSong = songs[startIndex];
    const resolvedIndex = startSong ? Math.max(0, queue.findIndex((song) => song.id === startSong.id)) : 0;

    await loadQueue(queue, resolvedIndex);
    await useSongGainStore.getState().applySongGain(queue[resolvedIndex]?.id);
    await TrackPlayer.play();

    set({
      queue,
      currentIndex: resolvedIndex,
      currentSong: queue[resolvedIndex],
    });
  },
  async playShuffledSongs(songs) {
    if (!songs.length) {
      return;
    }

    const queue = shuffled(songs);

    await loadQueue(queue, 0);
    await useSongGainStore.getState().applySongGain(queue[0].id);
    await TrackPlayer.play();

    set({
      queue,
      currentIndex: 0,
      currentSong: queue[0],
      shuffle: true,
    });
  },
  async togglePlay() {
    const playback = await TrackPlayer.getPlaybackState();
    if (playback.state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  },
  async next() {
    const { queue, currentIndex } = get();
    if (!queue.length) {
      return;
    }

    const nextIndex = currentIndex >= queue.length - 1 ? 0 : currentIndex + 1;
    await TrackPlayer.skip(nextIndex);
    await useSongGainStore.getState().applySongGain(queue[nextIndex].id);
    await TrackPlayer.play();
    set({ currentIndex: nextIndex, currentSong: queue[nextIndex] });
  },
  async previous() {
    const { queue, currentIndex } = get();
    if (!queue.length) {
      return;
    }

    const previousIndex = currentIndex <= 0 ? queue.length - 1 : currentIndex - 1;
    await TrackPlayer.skip(previousIndex);
    await useSongGainStore.getState().applySongGain(queue[previousIndex].id);
    await TrackPlayer.play();
    set({ currentIndex: previousIndex, currentSong: queue[previousIndex] });
  },
  seekTo(position) {
    return TrackPlayer.seekTo(position);
  },
  setCurrentIndex(index) {
    const queue = get().queue;
    if (typeof index !== 'number' || !queue[index]) {
      set({ currentIndex: -1, currentSong: undefined });
      void useSongGainStore.getState().applySongGain();
      return;
    }

    set({ currentIndex: index, currentSong: queue[index] });
    void useSongGainStore.getState().applySongGain(queue[index].id);
  },
  toggleShuffle() {
    set((state) => ({ shuffle: !state.shuffle }));
  },
  async cycleRepeat() {
    const nextMode: RepeatMode = get().repeatMode === 'off' ? 'all' : get().repeatMode === 'all' ? 'one' : 'off';
    await setNativeRepeatMode(nextMode);
    set({ repeatMode: nextMode });
  },
}));

export function useIsPlaying() {
  const playback = usePlaybackState();
  return playback.state === State.Playing;
}

export function useTrackProgress() {
  return useProgress(500);
}

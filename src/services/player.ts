import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  RepeatMode as TrackRepeatMode,
} from 'react-native-track-player';

import { RepeatMode, Song } from '../types/music';

let setupPromise: Promise<void> | undefined;

export async function setupPlayer() {
  if (!setupPromise) {
    setupPromise = initializePlayer().catch((error) => {
      setupPromise = undefined;
      throw error;
    });
  }

  return setupPromise;
}

async function initializePlayer() {
  try {
    await TrackPlayer.setupPlayer({
      autoHandleInterruptions: true,
    });
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;

    if (code !== 'player_already_initialized') {
      throw error;
    }
  }

  await TrackPlayer.updateOptions({
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
    },
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo,
      Capability.Stop,
    ],
    compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
    notificationCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
    ],
    progressUpdateEventInterval: 1,
  });
}

export function toTrack(song: Song) {
  return {
    id: song.id,
    url: song.uri,
    title: song.title,
    artist: song.artist,
    artwork: song.artwork,
  };
}

export async function loadQueue(songs: Song[], startIndex = 0) {
  await setupPlayer();
  await TrackPlayer.reset();
  await TrackPlayer.add(songs.map(toTrack));
  await TrackPlayer.skip(startIndex);
}

export async function setNativeRepeatMode(mode: RepeatMode) {
  const nativeMode =
    mode === 'one'
      ? TrackRepeatMode.Track
      : mode === 'all'
        ? TrackRepeatMode.Queue
        : TrackRepeatMode.Off;

  await TrackPlayer.setRepeatMode(nativeMode);
}

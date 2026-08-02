import TrackPlayer from 'react-native-track-player';

import { setupPlayer } from './player';

export const MIN_SONG_GAIN_DB = -12;
export const MAX_SONG_GAIN_DB = 12;
export const DEFAULT_SONG_GAIN_DB = 0;

export function normalizeSongGainDb(gainDb: number) {
  if (!Number.isFinite(gainDb)) {
    return DEFAULT_SONG_GAIN_DB;
  }

  return Math.max(MIN_SONG_GAIN_DB, Math.min(MAX_SONG_GAIN_DB, Math.round(gainDb)));
}

export function songGainDbToLinear(gainDb: number) {
  return Math.pow(10, normalizeSongGainDb(gainDb) / 20);
}

export async function applySongGainDb(gainDb: number) {
  await setupPlayer();
  await TrackPlayer.setVolume(songGainDbToLinear(gainDb));
}

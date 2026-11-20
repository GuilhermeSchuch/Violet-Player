import TrackPlayer, { Event, type Track } from 'react-native-track-player';

import { recordListen } from '../store/listeningHistory';

export async function playbackService() {
  // Progress events come from the native service while audio is playing, including with the screen off.
  let active: { index?: number; track?: Track; counted: boolean } = { counted: false };
  TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, ({ index, track }) => {
    active = { index, track, counted: false };
  });
  TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, async ({ track: index, position }) => {
    const entry = active;
    if (entry.counted || position <= 0 || (entry.index !== undefined && entry.index !== index)) return;
    entry.counted = true;
    try {
      const track = entry.track ?? await TrackPlayer.getTrack(index);
      if (entry === active && typeof track?.id === 'string') {
        await recordListen(track.id, track.playlistId);
      }
    } catch (error) {
      entry.counted = false;
      console.error('Unable to record listen', error);
    }
  });

  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) => TrackPlayer.seekTo(position));
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
}

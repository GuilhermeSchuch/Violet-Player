import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronDown, ListMusic } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Artwork } from '../src/components/Artwork';
import { PlayerControls } from '../src/components/PlayerControls';
import { PlaylistPicker } from '../src/components/PlaylistPicker';
import { ProgressBar } from '../src/components/ProgressBar';
import { SongGainSlider } from '../src/components/SongGainSlider';
import { usePlayerStore } from '../src/store/playerStore';
import { usePlaylistStore } from '../src/store/playlistStore';
import { colors, spacing } from '../src/utils/theme';

export default function PlayerScreen() {
  const currentSong = usePlayerStore((state) => state.currentSong);
  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const playlists = usePlaylistStore((state) => state.playlists);
  const addSong = usePlaylistStore((state) => state.addSong);
  const { height, width } = useWindowDimensions();
  const [isPlaylistPickerOpen, setIsPlaylistPickerOpen] = useState(false);
  const artworkSize = Math.floor(Math.min(270, width - spacing.lg * 4, height * 0.34));

  const openPlaylistPicker = useCallback(() => {
    if (!currentSong) {
      Alert.alert('Nothing playing', 'Choose a song before adding it to a playlist.');
      return;
    }

    if (!playlists.length) {
      Alert.alert('No playlists yet', 'Create a playlist first from the Playlists tab.');
      return;
    }

    setIsPlaylistPickerOpen(true);
  }, [currentSong, playlists.length]);

  const addCurrentSongToPlaylist = useCallback(
    (playlistId: string) => {
      if (!currentSong) {
        return;
      }

      addSong(playlistId, currentSong.id);
      setIsPlaylistPickerOpen(false);
    },
    [addSong, currentSong],
  );

  return (
    <LinearGradient colors={['#20113E', '#08080C', '#050507']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconButton}>
            <ChevronDown color={colors.text} size={28} />
          </Pressable>
          <Text style={styles.topTitle}>Now Playing</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add current song to playlist"
            onPress={openPlaylistPicker}
            hitSlop={12}
            style={styles.iconButton}
          >
            <ListMusic color={currentSong ? colors.text : colors.textMuted} size={24} />
          </Pressable>
        </View>

        <Animated.View entering={FadeIn.delay(80)} style={styles.artworkWrap}>
          <Artwork size={artworkSize} />
        </Animated.View>

        <View style={styles.panel}>
          <Text style={styles.title} numberOfLines={2}>
            {currentSong?.title ?? 'Nothing playing'}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentSong?.artist ?? 'Choose a song from your library'}
          </Text>

          <ProgressBar />
          <View style={styles.controls}>
            <PlayerControls />
          </View>
          <SongGainSlider />

          <Text style={styles.queueMeta}>
            {queue.length ? `${currentIndex + 1} of ${queue.length} in queue` : 'Queue is empty'}
          </Text>
        </View>
        <PlaylistPicker
          visible={isPlaylistPickerOpen}
          playlists={playlists}
          songTitle={currentSong?.title}
          onClose={() => setIsPlaylistPickerOpen(false)}
          onSelect={addCurrentSongToPlaylist}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  topTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  artworkWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    paddingBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  artist: {
    color: colors.textMuted,
    fontSize: 17,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  controls: {
    marginTop: spacing.xl,
  },
  queueMeta: {
    color: colors.textDim,
    textAlign: 'center',
    marginTop: spacing.lg,
    fontWeight: '700',
  },
});

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Pause, Play, SkipForward } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useIsPlaying, usePlayerStore } from '../store/playerStore';
import { colors, spacing } from '../utils/theme';
import { Artwork } from './Artwork';

export function MiniPlayer() {
  const currentSong = usePlayerStore((state) => state.currentSong);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const next = usePlayerStore((state) => state.next);
  const isPlaying = useIsPlaying();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  if (!currentSong || pathname === '/player') {
    return null;
  }

  return (
    <View style={[styles.wrap, { bottom: 78 + Math.max(insets.bottom, 16) }]}>
      <Pressable style={styles.container} onPress={() => router.push('/player')}>
        <Artwork size={44} />
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentSong.artist}
          </Text>
        </View>
        <Pressable onPress={togglePlay} hitSlop={10} style={styles.iconButton}>
          {isPlaying ? <Pause size={22} color={colors.text} /> : <Play size={22} color={colors.text} />}
        </Pressable>
        <Pressable onPress={next} hitSlop={10} style={styles.iconButton}>
          <SkipForward size={22} color={colors.primarySoft} />
        </Pressable>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 68,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#15151D',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    fontWeight: '700',
  },
  artist: {
    color: colors.textMuted,
    marginTop: 3,
    fontSize: 12,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
  },
});

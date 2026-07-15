import { Pressable, StyleSheet, View } from 'react-native';
import { Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward } from 'lucide-react-native';

import { useIsPlaying, usePlayerStore } from '../store/playerStore';
import { colors } from '../utils/theme';

export function PlayerControls() {
  const isPlaying = useIsPlaying();
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const next = usePlayerStore((state) => state.next);
  const previous = usePlayerStore((state) => state.previous);
  const shuffle = usePlayerStore((state) => state.shuffle);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
  const cycleRepeat = usePlayerStore((state) => state.cycleRepeat);

  return (
    <View style={styles.container}>
      <Pressable onPress={toggleShuffle} style={styles.secondaryButton}>
        <Shuffle size={22} color={shuffle ? colors.primarySoft : colors.textMuted} />
      </Pressable>
      <Pressable onPress={previous} style={styles.secondaryButton}>
        <SkipBack size={30} color={colors.text} />
      </Pressable>
      <Pressable onPress={togglePlay} style={styles.primaryButton}>
        {isPlaying ? <Pause size={34} color={colors.text} /> : <Play size={34} color={colors.text} />}
      </Pressable>
      <Pressable onPress={next} style={styles.secondaryButton}>
        <SkipForward size={30} color={colors.text} />
      </Pressable>
      <Pressable onPress={cycleRepeat} style={styles.secondaryButton}>
        {repeatMode === 'one' ? (
          <Repeat1 size={22} color={colors.primarySoft} />
        ) : (
          <Repeat size={22} color={repeatMode === 'all' ? colors.primarySoft : colors.textMuted} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 52,
    borderRadius: 26,
  },
});

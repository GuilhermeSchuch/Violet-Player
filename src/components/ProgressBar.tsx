import { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { usePlayerStore, useTrackProgress } from '../store/playerStore';
import { colors, spacing } from '../utils/theme';
import { formatTime } from '../utils/format';

export function ProgressBar() {
  const { position, duration } = useTrackProgress();
  const seekTo = usePlayerStore((state) => state.seekTo);
  const width = useSharedValue(1);
  const dragProgress = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const didCommitSeek = useSharedValue(false);
  const progress = duration ? position / duration : 0;

  const commitSeek = useCallback(
    (targetPosition: number, targetProgress: number) => {
      dragProgress.value = targetProgress;

      void seekTo(targetPosition).finally(() => {
        setTimeout(() => {
          isDragging.value = false;
        }, 350);
      });
    },
    [dragProgress, isDragging, seekTo],
  );

  const animatedFill = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(1, isDragging.value ? dragProgress.value : progress)) * 100}%`,
  }));

  const animatedKnob = useAnimatedStyle(() => ({
    transform: [{ translateX: Math.max(0, Math.min(1, isDragging.value ? dragProgress.value : progress)) * width.value - 8 }],
  }));

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(duration > 0)
        .onBegin((event) => {
          isDragging.value = true;
          didCommitSeek.value = false;
          dragProgress.value = Math.max(0, Math.min(1, event.x / width.value));
        })
        .onChange((event) => {
          dragProgress.value = Math.max(0, Math.min(1, event.x / width.value));
        })
        .onEnd(() => {
          didCommitSeek.value = true;
          runOnJS(commitSeek)(dragProgress.value * duration, dragProgress.value);
        })
        .onFinalize(() => {
          if (!didCommitSeek.value) {
            isDragging.value = false;
          }
        }),
    [commitSeek, didCommitSeek, dragProgress, duration, isDragging, width],
  );

  return (
    <View>
      <GestureDetector gesture={pan}>
        <View
          style={styles.track}
          onLayout={(event) => {
            width.value = event.nativeEvent.layout.width;
          }}
        >
          <Animated.View style={[styles.fill, animatedFill]} />
          <Animated.View style={[styles.knob, animatedKnob]} />
        </View>
      </GestureDetector>
      <View style={styles.times}>
        <Text style={styles.time}>{formatTime(position)}</Text>
        <Text style={styles.time}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    justifyContent: 'center',
    height: 32,
    marginTop: spacing.lg,
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  knob: {
    position: 'absolute',
    left: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.text,
  },
  times: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
});

import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import {
  DEFAULT_SONG_GAIN_DB,
  MAX_SONG_GAIN_DB,
  MIN_SONG_GAIN_DB,
} from '../services/songGain';
import { usePlayerStore } from '../store/playerStore';
import { useSongGainStore } from '../store/songGainStore';
import { colors, spacing } from '../utils/theme';

function clampGainDb(gainDb: number) {
  'worklet';

  const roundedGainDb = Math.round(gainDb);

  if (roundedGainDb !== roundedGainDb) {
    return DEFAULT_SONG_GAIN_DB;
  }

  return Math.max(MIN_SONG_GAIN_DB, Math.min(MAX_SONG_GAIN_DB, roundedGainDb));
}

function gainDbToPercent(gainDb: number) {
  'worklet';

  return (clampGainDb(gainDb) - MIN_SONG_GAIN_DB) / (MAX_SONG_GAIN_DB - MIN_SONG_GAIN_DB);
}

function gainDbFromX(x: number, width: number) {
  'worklet';

  const percent = Math.max(0, Math.min(1, x / width));
  return clampGainDb(MIN_SONG_GAIN_DB + percent * (MAX_SONG_GAIN_DB - MIN_SONG_GAIN_DB));
}

function formatGainDb(gainDb: number) {
  if (gainDb > 0) {
    return `+${gainDb} dB`;
  }

  return `${gainDb} dB`;
}

export function SongGainSlider() {
  const currentSong = usePlayerStore((state) => state.currentSong);
  const gainDb = useSongGainStore((state) =>
    currentSong ? state.gainDbBySongId[currentSong.id] ?? DEFAULT_SONG_GAIN_DB : DEFAULT_SONG_GAIN_DB,
  );
  const setSongGainDb = useSongGainStore((state) => state.setSongGainDb);
  const [draftGainDb, setDraftGainDb] = useState(gainDb);
  const width = useSharedValue(1);
  const dragGainDb = useSharedValue(gainDb);
  const isEnabled = Boolean(currentSong);

  useEffect(() => {
    setDraftGainDb(gainDb);
    dragGainDb.value = gainDb;
  }, [dragGainDb, gainDb]);

  const commitGainDb = useCallback(
    (nextGainDb: number) => {
      if (!currentSong) {
        return;
      }

      void setSongGainDb(currentSong.id, nextGainDb);
    },
    [currentSong, setSongGainDb],
  );

  const animatedActiveFill = useAnimatedStyle(() => {
    const percent = gainDbToPercent(dragGainDb.value);
    const zeroPercent = gainDbToPercent(DEFAULT_SONG_GAIN_DB);
    const left = Math.min(percent, zeroPercent) * width.value;

    return {
      left,
      width: Math.abs(percent - zeroPercent) * width.value,
      backgroundColor: dragGainDb.value >= DEFAULT_SONG_GAIN_DB ? colors.primary : colors.textMuted,
    };
  });

  const animatedKnob = useAnimatedStyle(() => ({
    transform: [{ translateX: gainDbToPercent(dragGainDb.value) * width.value - 9 }],
  }));

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(isEnabled)
        .minDistance(0)
        .onBegin((event) => {
          const nextGainDb = gainDbFromX(event.x, width.value);
          dragGainDb.value = nextGainDb;
          runOnJS(setDraftGainDb)(nextGainDb);
        })
        .onChange((event) => {
          const nextGainDb = gainDbFromX(event.x, width.value);
          dragGainDb.value = nextGainDb;
          runOnJS(setDraftGainDb)(nextGainDb);
        })
        .onEnd(() => {
          runOnJS(commitGainDb)(dragGainDb.value);
        }),
    [commitGainDb, dragGainDb, isEnabled, width],
  );

  return (
    <View style={[styles.container, !isEnabled && styles.disabled]}>
      <View style={styles.header}>
        <Text style={styles.label}>Song gain</Text>
        <Text style={styles.value}>{formatGainDb(draftGainDb)}</Text>
      </View>
      <GestureDetector gesture={pan}>
        <View
          accessibilityRole="adjustable"
          accessibilityLabel="Song gain"
          style={styles.track}
          onLayout={(event) => {
            width.value = event.nativeEvent.layout.width;
          }}
        >
          <View style={styles.rail} />
          <Animated.View style={[styles.activeFill, animatedActiveFill]} />
          <View style={styles.zeroTick} />
          <Animated.View style={[styles.knob, animatedKnob]} />
        </View>
      </GestureDetector>
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabel}>{formatGainDb(MIN_SONG_GAIN_DB)}</Text>
        <Text style={styles.rangeLabel}>0 dB</Text>
        <Text style={styles.rangeLabel}>{formatGainDb(MAX_SONG_GAIN_DB)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  disabled: {
    opacity: 0.45,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  value: {
    color: colors.text,
    fontSize: 14,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
  },
  track: {
    justifyContent: 'center',
    height: 32,
    marginTop: spacing.xs,
  },
  rail: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  activeFill: {
    position: 'absolute',
    height: 5,
    borderRadius: 3,
  },
  zeroTick: {
    position: 'absolute',
    alignSelf: 'center',
    width: 2,
    height: 14,
    borderRadius: 1,
    backgroundColor: colors.textDim,
  },
  knob: {
    position: 'absolute',
    left: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.text,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeLabel: {
    color: colors.textDim,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
});

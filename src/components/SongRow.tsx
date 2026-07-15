import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ListPlus, LucideIcon, MoreHorizontal } from 'lucide-react-native';

import { Song } from '../types/music';
import { colors, spacing } from '../utils/theme';
import { Artwork } from './Artwork';

type SongRowProps = {
  song: Song;
  isActive?: boolean;
  onPress: () => void;
  onMenuPress?: () => void;
  menuIcon?: LucideIcon;
};

function SongRowComponent({ song, isActive, onPress, onMenuPress, menuIcon: MenuIcon }: SongRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, isActive && styles.activeRow, pressed && styles.pressed]}
    >
      <Artwork size={50} />
      <View style={styles.copy}>
        <Text style={[styles.title, isActive && styles.activeTitle]} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {song.artist}
        </Text>
      </View>
      <Pressable onPress={onMenuPress} hitSlop={12} style={styles.iconButton}>
        {onMenuPress ? (
          MenuIcon ? (
            <MenuIcon size={20} color={colors.textMuted} />
          ) : (
            <ListPlus size={20} color={colors.textMuted} />
          )
        ) : (
          <MoreHorizontal size={20} color={colors.textDim} />
        )}
      </Pressable>
    </Pressable>
  );
}

export const SongRow = memo(SongRowComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 72,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    gap: spacing.md,
  },
  activeRow: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  pressed: {
    opacity: 0.72,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  activeTitle: {
    color: colors.primarySoft,
  },
  artist: {
    color: colors.textMuted,
    marginTop: 4,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
  },
});

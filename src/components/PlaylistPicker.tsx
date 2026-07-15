import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ListMusic, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Playlist } from '../types/music';
import { colors, spacing } from '../utils/theme';

type PlaylistPickerProps = {
  visible: boolean;
  playlists: Playlist[];
  songTitle?: string;
  onClose: () => void;
  onSelect: (playlistId: string) => void;
};

export function PlaylistPicker({ visible, playlists, songTitle, onClose, onSelect }: PlaylistPickerProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close playlist picker" style={styles.dismissArea} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Add to playlist</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {songTitle ?? 'Choose a playlist'}
              </Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={12} style={styles.closeButton}>
              <X color={colors.textMuted} size={22} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.playlistScroll}
            contentContainerStyle={styles.playlistList}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {playlists.map((playlist) => (
              <Pressable
                key={playlist.id}
                accessibilityRole="button"
                accessibilityLabel={`Add to ${playlist.name}`}
                onPress={() => onSelect(playlist.id)}
                style={({ pressed }) => [styles.playlistRow, pressed && styles.pressed]}
              >
                <View style={styles.iconShell}>
                  <ListMusic color={colors.primarySoft} size={22} />
                </View>
                <View style={styles.playlistCopy}>
                  <Text style={styles.playlistName} numberOfLines={1}>
                    {playlist.name}
                  </Text>
                  <Text style={styles.playlistMeta}>
                    {playlist.songIds.length === 1 ? '1 song' : `${playlist.songIds.length} songs`}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    maxHeight: '72%',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: colors.panel,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: 4,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.panelElevated,
  },
  playlistScroll: {
    flexGrow: 0,
  },
  playlistList: {
    gap: spacing.sm,
  },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 68,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.panelElevated,
  },
  pressed: {
    opacity: 0.72,
  },
  iconShell: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.14)',
  },
  playlistCopy: {
    flex: 1,
    minWidth: 0,
  },
  playlistName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  playlistMeta: {
    color: colors.textMuted,
    marginTop: 3,
    fontSize: 12,
  },
});

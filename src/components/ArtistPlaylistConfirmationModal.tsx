import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Disc3 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '../utils/theme';

type ArtistPlaylistConfirmationModalProps = {
  artistNames: string[];
  visible: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
};

export function ArtistPlaylistConfirmationModal({
  artistNames,
  visible,
  onConfirm,
  onDismiss,
}: ArtistPlaylistConfirmationModalProps) {
  const insets = useSafeAreaInsets();
  const previewNames = artistNames.slice(0, 5).join(', ');
  const remainingCount = artistNames.length - 5;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View
        accessibilityViewIsModal
        style={[
          styles.backdrop,
          {
            paddingTop: Math.max(insets.top, spacing.lg),
            paddingBottom: Math.max(insets.bottom, spacing.lg),
          },
        ]}
      >
        <View style={styles.dialog}>
          <View style={styles.iconShell}>
            <Disc3 color={colors.primarySoft} size={28} />
          </View>
          <Text style={styles.title}>Create artist playlists?</Text>
          <Text style={styles.description}>
            We found {artistNames.length} {artistNames.length === 1 ? 'artist' : 'artists'} with multiple songs. Create a playlist for each?
          </Text>
          <Text style={styles.artistNames} numberOfLines={3}>
            {previewNames}
            {remainingCount > 0 ? `, and ${remainingCount} more` : ''}
          </Text>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onDismiss}
              style={({ pressed }) => [styles.secondaryAction, pressed && styles.actionPressed]}
            >
              <Text style={styles.secondaryText}>Not now</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              style={({ pressed }) => [styles.primaryAction, pressed && styles.actionPressed]}
            >
              <Text style={styles.primaryText}>Create playlists</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    padding: spacing.lg,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.panel,
  },
  iconShell: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 54,
    height: 54,
    borderRadius: 8,
    marginBottom: spacing.md,
    backgroundColor: 'rgba(139, 92, 246, 0.14)',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  description: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  artistNames: {
    color: colors.primarySoft,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  primaryAction: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: colors.text,
    fontWeight: '800',
  },
  secondaryAction: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  secondaryText: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  actionPressed: {
    opacity: 0.76,
  },
});

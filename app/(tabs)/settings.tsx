import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { FolderOpen, RefreshCw } from 'lucide-react-native';

import { Screen } from '../../src/components/Screen';
import { requestMusicFolder } from '../../src/services/libraryScanner';
import { useLibraryStore } from '../../src/store/libraryStore';
import { colors, spacing } from '../../src/utils/theme';

export default function SettingsScreen() {
  const folderUri = useLibraryStore((state) => state.folderUri);
  const songs = useLibraryStore((state) => state.songs);
  const setFolder = useLibraryStore((state) => state.setFolder);
  const rescan = useLibraryStore((state) => state.rescan);
  const isScanning = useLibraryStore((state) => state.isScanning);

  async function chooseFolder() {
    try {
      const directoryUri = await requestMusicFolder();
      if (directoryUri) {
        await setFolder(directoryUri);
      }
    } catch (error) {
      Alert.alert('Folder access unavailable', error instanceof Error ? error.message : 'Unable to choose folder.');
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.heading}>Settings</Text>
        <Text style={styles.subhead}>Local files, durable permissions, background playback.</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.settingRow}>
          <FolderOpen color={colors.primarySoft} size={24} />
          <View style={styles.settingCopy}>
            <Text style={styles.settingTitle}>Music folder</Text>
            <Text style={styles.settingValue} numberOfLines={2}>
              {folderUri ?? 'No folder selected'}
            </Text>
          </View>
        </View>
        <Pressable onPress={chooseFolder} style={styles.primaryAction}>
          <Text style={styles.primaryText}>Choose folder</Text>
        </Pressable>
        <Pressable onPress={rescan} disabled={!folderUri || isScanning} style={styles.secondaryAction}>
          <RefreshCw color={colors.text} size={18} />
          <Text style={styles.secondaryText}>{isScanning ? 'Scanning...' : `Rescan ${songs.length} songs`}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: spacing.lg,
  },
  heading: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '800',
  },
  subhead: {
    color: colors.textMuted,
    marginTop: 4,
  },
  section: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  settingRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  settingCopy: {
    flex: 1,
  },
  settingTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  settingValue: {
    color: colors.textMuted,
    lineHeight: 20,
  },
  primaryAction: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginTop: spacing.lg,
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
    flexDirection: 'row',
    gap: spacing.sm,
    height: 50,
    marginTop: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.panelElevated,
  },
  secondaryText: {
    color: colors.text,
    fontWeight: '700',
  },
});

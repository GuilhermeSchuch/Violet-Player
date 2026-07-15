import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FileAudio } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '../utils/theme';

const onboardingKey = 'violet-player:filename-onboarding:v1';

type FirstLaunchModalProps = {
  enabled: boolean;
};

export function FirstLaunchModal({ enabled }: FirstLaunchModalProps) {
  const [visible, setVisible] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isMounted = true;

    void AsyncStorage.getItem(onboardingKey)
      .then((hasAcknowledged) => {
        if (isMounted && !hasAcknowledged) {
          setVisible(true);
        }
      })
      .catch((error) => {
        console.error('Unable to read onboarding state', error);
      });

    return () => {
      isMounted = false;
    };
  }, [enabled]);

  async function acknowledge() {
    setVisible(false);

    try {
      await AsyncStorage.setItem(onboardingKey, 'acknowledged');
    } catch (error) {
      console.error('Unable to save onboarding state', error);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => undefined}
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
            <FileAudio color={colors.primarySoft} size={30} />
          </View>

          <Text style={styles.title}>Name your music files</Text>
          <Text style={styles.description}>
            Violet Player reads the artist and song title directly from each MP3 filename.
          </Text>

          <View style={styles.example}>
            <Text style={styles.exampleLabel}>Filename format</Text>
            <Text style={styles.fileName}>Band - Song.mp3</Text>
            <View style={styles.divider} />
            <Text style={styles.exampleFile}>3 Doors Down - Here Without You.mp3</Text>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Artist</Text>
              <Text style={styles.metadataValue}>3 Doors Down</Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Song</Text>
              <Text style={styles.metadataValue}>Here Without You</Text>
            </View>
          </View>

          <Text style={styles.note}>Rename files that do not follow this format before scanning your folder.</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="I understand"
            onPress={acknowledge}
            style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
          >
            <Text style={styles.actionText}>I understand</Text>
          </Pressable>
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
    fontSize: 24,
    fontWeight: '800',
  },
  description: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  example: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.panelElevated,
  },
  exampleLabel: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  fileName: {
    color: colors.primarySoft,
    fontSize: 17,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.md,
    backgroundColor: colors.border,
  },
  exampleFile: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    minHeight: 26,
  },
  metadataLabel: {
    color: colors.textDim,
    fontSize: 13,
  },
  metadataValue: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'right',
  },
  note: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.md,
  },
  action: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 8,
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
  },
  actionPressed: {
    opacity: 0.76,
  },
  actionText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
});

import { useEffect, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Event, useTrackPlayerEvents } from 'react-native-track-player';

import { FirstLaunchModal } from '../src/components/FirstLaunchModal';
import { MiniPlayer } from '../src/components/MiniPlayer';
import { requestStartupPermissions } from '../src/services/permissions';
import { useLibraryStore } from '../src/store/libraryStore';
import { usePlayerStore } from '../src/store/playerStore';
import { colors } from '../src/utils/theme';

export default function RootLayout() {
  const setCurrentIndex = usePlayerStore((state) => state.setCurrentIndex);
  const libraryHasHydrated = useLibraryStore((state) => state.hasHydrated);
  const validateSavedFolder = useLibraryStore((state) => state.validateSavedFolder);
  const [permissionsChecked, setPermissionsChecked] = useState(false);

  useEffect(() => {
    if (!libraryHasHydrated) {
      return;
    }

    let isMounted = true;

    void requestStartupPermissions()
      .then(async (missingPermissions) => {
        if (!isMounted) {
          return;
        }

        if (missingPermissions.length) {
          Alert.alert(
            'Permissions required',
            `Violet Player still needs ${missingPermissions.join(' and ')}. Open Android settings to enable it. After reinstalling the app, choose your music folder again.`,
            [
              { text: 'Later', style: 'cancel' },
              { text: 'Open settings', onPress: () => void Linking.openSettings() },
            ],
          );
          return;
        }

        await validateSavedFolder();
      })
      .catch((error) => {
        console.error('Unable to check startup permissions', error);
      })
      .finally(() => {
        if (isMounted) {
          setPermissionsChecked(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [libraryHasHydrated, validateSavedFolder]);

  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], ({ index }) => {
    setCurrentIndex(index);
  });

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'fade_from_bottom',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="player" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="playlist/[id]" options={{ animation: 'slide_from_right' }} />
        </Stack>
        <MiniPlayer />
        <FirstLaunchModal enabled={permissionsChecked} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

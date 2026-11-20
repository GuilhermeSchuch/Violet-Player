import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { FolderOpen, ListMusic, Music2, Play, Shuffle } from 'lucide-react-native';

import { Screen } from '../../src/components/Screen';
import { requestMusicFolder } from '../../src/services/libraryScanner';
import { useLibraryStore } from '../../src/store/libraryStore';
import { listeningLists, useListeningHistory } from '../../src/store/listeningHistory';
import { usePlayerStore } from '../../src/store/playerStore';
import { usePlaylistStore } from '../../src/store/playlistStore';
import { Playlist, Song } from '../../src/types/music';
import { colors, spacing } from '../../src/utils/theme';

function countLabel(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

async function perform(action: Promise<unknown>) {
  try {
    await action;
  } catch (error) {
    Alert.alert('Unable to complete action', error instanceof Error ? error.message : 'Please try again.');
  }
}

function HistoryRow({ title, detail, onPress, onPlay }: {
  title: string;
  detail: string;
  onPress: () => void;
  onPlay?: () => void;
}) {
  const Icon = onPlay ? ListMusic : Music2;
  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.rowMain}>
        <Icon color={colors.primarySoft} size={22} />
        <View style={styles.copy}>
          <Text numberOfLines={1} style={styles.rowTitle}>{title}</Text>
          <Text numberOfLines={1} style={styles.detail}>{detail}</Text>
        </View>
      </Pressable>
      {onPlay && (
        <Pressable accessibilityRole="button" accessibilityLabel={`Play ${title}`} onPress={onPlay} style={styles.play}>
          <Play size={20} color={colors.primarySoft} />
        </Pressable>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const { songs, folderUri, hasHydrated, isScanning, setFolder, error } = useLibraryStore();
  const playlists = usePlaylistStore((state) => state.playlists);
  const history = useListeningHistory();
  const songLists = useMemo(() => listeningLists(songs, history.songs, 5), [songs, history.songs]);
  const availableIds = useMemo(() => new Set(songs.map((song) => song.id)), [songs]);
  const playlistLists = useMemo(() => listeningLists(
    playlists.filter((playlist) => playlist.songIds.some((id) => availableIds.has(id))),
    history.playlists, 4,
  ), [playlists, availableIds, history.playlists]);

  async function chooseFolder() {
    const uri = await requestMusicFolder();
    if (uri) await setFolder(uri);
  }

  function playlistSection(title: string, items: Playlist[], showCount = false) {
    if (!items.length) return null;
    return (
      <View>
        <Text style={styles.section}>{title}</Text>
        {items.map((playlist) => {
          const size = playlist.songIds.filter((id) => availableIds.has(id)).length;
          const detail = showCount ? countLabel(history.playlists[playlist.id].plays, 'track play') : countLabel(size, 'song');
          return (
            <HistoryRow key={playlist.id} title={playlist.name} detail={detail}
              onPress={() => router.push(`/playlist/${playlist.id}`)}
              onPlay={() => {
                const ids = new Set(playlist.songIds);
                const queue = songs.filter((song) => ids.has(song.id));
                void perform(usePlayerStore.getState().playSongs(queue, 0, playlist.id));
              }}
            />
          );
        })}
      </View>
    );
  }

  function songSection(title: string, items: Song[], showCount = false) {
    if (!items.length) return null;
    return (
      <View>
        <Text style={styles.section}>{title}</Text>
        {items.map((song) => (
          <HistoryRow key={song.id} title={song.title}
            detail={showCount ? `${song.artist} · ${countLabel(history.songs[song.id].plays, 'play')}` : song.artist}
            onPress={() => perform(usePlayerStore.getState().playSongs(songs, songs.indexOf(song)))}
          />
        ))}
      </View>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.heading}>Home</Text>
        {playlistSection('Recent playlists', playlistLists.recent)}
        <View style={styles.actions}>
          {songs.length > 0 ? (
            <Pressable accessibilityRole="button" style={styles.primary}
              onPress={() => perform(usePlayerStore.getState().playShuffledSongs(songs))}>
              <Shuffle size={20} color={colors.text} />
              <Text style={styles.actionText}>Shuffle {countLabel(songs.length, 'song')}</Text>
            </Pressable>
          ) : !hasHydrated || isScanning ? (
            <Text style={styles.detail}>Loading your music…</Text>
          ) : (
            <>
              {folderUri && <Text style={styles.detail}>No playable songs in this folder.</Text>}
              <Pressable accessibilityRole="button" style={styles.primary} onPress={() => perform(chooseFolder())}>
                <FolderOpen size={20} color={colors.text} />
                <Text style={styles.actionText}>Choose music folder</Text>
              </Pressable>
            </>
          )}
          {error && <Text style={styles.error}>{error}</Text>}
          <Pressable accessibilityRole="button" onPress={() => router.push('/playlists')} style={styles.secondary}>
            <ListMusic size={20} color={colors.primarySoft} />
            <Text style={styles.actionText}>Browse playlists</Text>
          </Pressable>
        </View>
        {songSection('Recently played songs', songLists.recent)}
        {playlistSection('Most played playlists', playlistLists.top, true)}
        {songSection('Most played songs', songLists.top, true)}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: 196, gap: spacing.lg },
  heading: { color: colors.text, fontSize: 36, fontWeight: '800' },
  section: { color: colors.text, fontSize: 21, fontWeight: '700', marginBottom: spacing.sm },
  actions: { gap: spacing.sm },
  primary: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary, borderRadius: 8 },
  secondary: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.panelElevated, borderRadius: 8 },
  actionText: { color: colors.text, fontWeight: '700', fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowMain: { minHeight: 62, flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  copy: { flex: 1, gap: 3 },
  rowTitle: { color: colors.text, fontWeight: '600', fontSize: 16 },
  detail: { color: colors.textMuted },
  play: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  error: { color: colors.danger },
});

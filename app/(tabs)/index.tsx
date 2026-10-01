import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { FolderOpen, Music, Search, Shuffle, X } from 'lucide-react-native';

import { EmptyState } from '../../src/components/EmptyState';
import { PlaylistPicker } from '../../src/components/PlaylistPicker';
import { Screen } from '../../src/components/Screen';
import { SongRow } from '../../src/components/SongRow';
import { requestMusicFolder } from '../../src/services/libraryScanner';
import { Song } from '../../src/types/music';
import { useLibraryStore } from '../../src/store/libraryStore';
import { usePlayerStore } from '../../src/store/playerStore';
import { usePlaylistStore } from '../../src/store/playlistStore';
import { colors, spacing } from '../../src/utils/theme';

export default function LibraryScreen() {
  const songs = useLibraryStore((state) => state.songs);
  const isScanning = useLibraryStore((state) => state.isScanning);
  const folderUri = useLibraryStore((state) => state.folderUri);
  const error = useLibraryStore((state) => state.error);
  const setFolder = useLibraryStore((state) => state.setFolder);
  const rescan = useLibraryStore((state) => state.rescan);
  const currentSong = usePlayerStore((state) => state.currentSong);
  const playSongs = usePlayerStore((state) => state.playSongs);
  const playShuffledSongs = usePlayerStore((state) => state.playShuffledSongs);
  const playlists = usePlaylistStore((state) => state.playlists);
  const addSong = usePlaylistStore((state) => state.addSong);
  const [query, setQuery] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | undefined>();

  const title = useMemo(() => (songs.length === 1 ? '1 song' : `${songs.length} songs`), [songs.length]);
  const filteredSongs = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    if (!normalizedQuery) {
      return songs;
    }

    return songs.filter((song) =>
      `${song.title} ${song.artist} ${song.fileName}`.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [query, songs]);

  const chooseFolder = useCallback(async () => {
    try {
      const directoryUri = await requestMusicFolder();
      if (directoryUri) {
        await setFolder(directoryUri);
      }
    } catch (scanError) {
      Alert.alert('Folder access unavailable', scanError instanceof Error ? scanError.message : 'Unable to choose folder.');
    }
  }, [setFolder]);

  const openPlaylistPicker = useCallback(
    (song: Song) => {
      if (!playlists.length) {
        Alert.alert('No playlists yet', 'Create a playlist first from the Playlists tab.');
        return;
      }

      setSelectedSong(song);
    },
    [playlists],
  );

  const addSelectedSongToPlaylist = useCallback(
    (playlistId: string) => {
      if (!selectedSong) {
        return;
      }

      addSong(playlistId, selectedSong.id);
      setSelectedSong(undefined);
    },
    [addSong, selectedSong],
  );

  const playSong = useCallback(
    async (song: Song) => {
      try {
        const startIndex = songs.findIndex((librarySong) => librarySong.id === song.id);
        if (startIndex >= 0) {
          await playSongs(songs, startIndex);
        }
      } catch (playbackError) {
        console.error('Unable to play song', playbackError);
        Alert.alert(
          'Unable to play song',
          playbackError instanceof Error ? playbackError.message : 'The audio player could not load this file.',
        );
      }
    },
    [playSongs, songs],
  );

  const shuffleSongs = useCallback(async () => {
    try {
      await playShuffledSongs(songs);
    } catch (playbackError) {
      console.error('Unable to shuffle songs', playbackError);
      Alert.alert(
        'Unable to play songs',
        playbackError instanceof Error ? playbackError.message : 'The audio player could not load these files.',
      );
    }
  }, [playShuffledSongs, songs]);

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Violet Player</Text>
          <Text style={styles.heading}>Library</Text>
          <Text style={styles.subhead}>{folderUri ? title : 'Choose a folder to begin'}</Text>
        </View>
        <Pressable onPress={chooseFolder} style={styles.folderButton}>
          <FolderOpen color={colors.text} size={22} />
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {songs.length ? (
        <View style={styles.libraryTools}>
          <View style={styles.searchWrap}>
            <Search color={colors.textMuted} size={20} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search songs or artists"
              placeholderTextColor={colors.textDim}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={12} style={styles.clearButton}>
                <X color={colors.textMuted} size={18} />
              </Pressable>
            ) : null}
          </View>
          <Pressable
            onPress={shuffleSongs}
            disabled={!filteredSongs.length}
            style={({ pressed }) => [styles.shuffleButton, (!filteredSongs.length || pressed) && styles.softPressed]}
          >
            <Shuffle color={colors.text} size={18} />
            <Text style={styles.shuffleText}>Shuffle</Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        data={filteredSongs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, !filteredSongs.length && styles.emptyList]}
        refreshControl={<RefreshControl refreshing={isScanning} onRefresh={rescan} tintColor={colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            icon={Music}
            title={query ? 'No matches found' : folderUri ? 'No MP3 files found' : 'Your music lives here'}
            message={
              query
                ? 'Try another song title or artist.'
                : folderUri
                  ? 'Pull to rescan or choose another folder.'
                  : 'Select a folder containing Band - Song Name.mp3 files.'
            }
          />
        }
        renderItem={({ item }) => (
          <SongRow
            song={item}
            isActive={currentSong?.id === item.id}
            onPress={() => playSong(item)}
            onMenuPress={() => openPlaylistPicker(item)}
          />
        )}
        initialNumToRender={14}
        maxToRenderPerBatch={18}
        windowSize={8}
      />
      <PlaylistPicker
        visible={Boolean(selectedSong)}
        playlists={playlists}
        songTitle={selectedSong?.title}
        onClose={() => setSelectedSong(undefined)}
        onSelect={addSelectedSongToPlaylist}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  eyebrow: {
    color: colors.primarySoft,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
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
  folderButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.panelElevated,
  },
  error: {
    color: colors.danger,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  libraryTools: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 52,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: 16,
  },
  clearButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  softPressed: {
    opacity: 0.72,
  },
  shuffleText: {
    color: colors.text,
    fontWeight: '800',
  },
  list: {
    paddingHorizontal: spacing.sm,
    paddingBottom: 196,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

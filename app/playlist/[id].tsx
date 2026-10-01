import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Library, ListMusic, Pencil, Play, Search, Settings, Shuffle, Trash2, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../../src/components/EmptyState';
import { Screen } from '../../src/components/Screen';
import { SongRow } from '../../src/components/SongRow';
import { useLibraryStore } from '../../src/store/libraryStore';
import { usePlayerStore } from '../../src/store/playerStore';
import { usePlaylistStore } from '../../src/store/playlistStore';
import { colors, spacing } from '../../src/utils/theme';

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const songs = useLibraryStore((state) => state.songs);
  const playlists = usePlaylistStore((state) => state.playlists);
  const renamePlaylist = usePlaylistStore((state) => state.renamePlaylist);
  const removeSong = usePlaylistStore((state) => state.removeSong);
  const playSongs = usePlayerStore((state) => state.playSongs);
  const playShuffledSongs = usePlayerStore((state) => state.playShuffledSongs);
  const currentSong = usePlayerStore((state) => state.currentSong);
  const insets = useSafeAreaInsets();
  const playlist = playlists.find((item) => item.id === id);
  const playlistSongs = useMemo(
    () => songs.filter((song) => playlist?.songIds.includes(song.id)),
    [playlist?.songIds, songs],
  );
  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState(playlist?.name ?? '');
  const [query, setQuery] = useState('');

  const filteredPlaylistSongs = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    if (!normalizedQuery) {
      return playlistSongs;
    }

    return playlistSongs.filter((song) =>
      `${song.title} ${song.artist} ${song.fileName}`.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [playlistSongs, query]);

  if (!playlist) {
    return (
      <Screen>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <ChevronLeft color={colors.text} size={28} />
          </Pressable>
        </View>
        <EmptyState icon={Trash2} title="Playlist not found" message="It may have been deleted." />
      </Screen>
    );
  }

  function saveName() {
    if (playlist) {
      renamePlaylist(playlist.id, name);
      setIsRenaming(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <ChevronLeft color={colors.text} size={28} />
        </Pressable>
        <Pressable
          onPress={() => {
            setName(playlist.name);
            setIsRenaming(true);
          }}
          style={styles.iconButton}
        >
          <Pencil color={colors.textMuted} size={22} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heading}>{playlist.name}</Text>
        <Text style={styles.subhead}>{playlistSongs.length} songs</Text>
        <View style={styles.heroActions}>
          <Pressable
            onPress={() => playlistSongs.length && playSongs(playlistSongs, 0)}
            disabled={!playlistSongs.length}
            style={[styles.playButton, !playlistSongs.length && styles.disabledButton]}
          >
            <Play color={colors.text} size={20} />
            <Text style={styles.playText}>Play</Text>
          </Pressable>
          <Pressable
            onPress={() => playShuffledSongs(playlistSongs)}
            disabled={!playlistSongs.length}
            style={[styles.shuffleButton, !playlistSongs.length && styles.disabledButton]}
          >
            <Shuffle color={colors.primarySoft} size={20} />
            <Text style={styles.shuffleText}>Shuffle</Text>
          </Pressable>
        </View>
      </View>

      {playlistSongs.length ? (
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
      ) : null}

      <FlatList
        data={filteredPlaylistSongs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, !filteredPlaylistSongs.length && styles.emptyList]}
        ListEmptyComponent={
          <EmptyState
            icon={Play}
            title={query ? 'No matches found' : 'No songs here'}
            message={query ? 'Try another song title or artist.' : 'Add songs from the Library tab.'}
          />
        }
        renderItem={({ item }) => (
          <SongRow
            song={item}
            isActive={currentSong?.id === item.id}
            onPress={() => {
              const startIndex = playlistSongs.findIndex((playlistSong) => playlistSong.id === item.id);
              if (startIndex >= 0) {
                void playSongs(playlistSongs, startIndex);
              }
            }}
            onMenuPress={() => removeSong(playlist.id, item.id)}
            menuIcon={Trash2}
          />
        )}
      />

      <View style={[styles.bottomTabs, { height: 70 + Math.max(insets.bottom, 16), paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable onPress={() => router.replace('/')} style={styles.tabItem}>
          <Library color={colors.textDim} size={24} />
          <Text style={styles.tabText}>Library</Text>
        </Pressable>
        <Pressable onPress={() => router.replace('/playlists')} style={styles.tabItem}>
          <ListMusic color={colors.primarySoft} size={24} />
          <Text style={[styles.tabText, styles.activeTabText]}>Playlists</Text>
        </Pressable>
        <Pressable onPress={() => router.replace('/settings')} style={styles.tabItem}>
          <Settings color={colors.textDim} size={24} />
          <Text style={styles.tabText}>Settings</Text>
        </Pressable>
      </View>

      <Modal visible={isRenaming} transparent animationType="fade" onRequestClose={() => setIsRenaming(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rename playlist</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Playlist name"
              placeholderTextColor={colors.textDim}
              style={styles.input}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setIsRenaming(false)} style={styles.secondaryAction}>
                <Text style={styles.secondaryText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={saveName} style={styles.primaryAction}>
                <Text style={styles.primaryText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
  hero: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  heading: {
    color: colors.text,
    fontSize: 38,
    fontWeight: '800',
  },
  subhead: {
    color: colors.textMuted,
    marginTop: 4,
  },
  heroActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    width: 132,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    width: 142,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.panelElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  disabledButton: {
    opacity: 0.4,
  },
  playText: {
    color: colors.text,
    fontWeight: '800',
  },
  shuffleText: {
    color: colors.text,
    fontWeight: '800',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 52,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
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
  list: {
    paddingHorizontal: spacing.sm,
    paddingBottom: 196,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  modalCard: {
    padding: spacing.lg,
    borderRadius: 8,
    backgroundColor: colors.panelElevated,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  input: {
    height: 52,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    color: colors.text,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  primaryAction: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: colors.text,
    fontWeight: '800',
  },
  secondaryAction: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  secondaryText: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  bottomTabs: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: '#0B0B10',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabText: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '700',
  },
  activeTabText: {
    color: colors.primarySoft,
  },
});

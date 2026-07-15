import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { ListMusic, Plus, Search, Trash2, X } from 'lucide-react-native';

import { EmptyState } from '../../src/components/EmptyState';
import { Screen } from '../../src/components/Screen';
import { usePlaylistStore } from '../../src/store/playlistStore';
import { colors, spacing } from '../../src/utils/theme';

export default function PlaylistsScreen() {
  const playlists = usePlaylistStore((state) => state.playlists);
  const createPlaylist = usePlaylistStore((state) => state.createPlaylist);
  const deletePlaylist = usePlaylistStore((state) => state.deletePlaylist);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');

  const filteredPlaylists = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    if (!normalizedQuery) {
      return playlists;
    }

    return playlists.filter((playlist) => playlist.name.toLocaleLowerCase().includes(normalizedQuery));
  }, [playlists, query]);

  function savePlaylist() {
    const id = createPlaylist(name);
    setName('');
    setIsCreating(false);
    router.push(`/playlist/${id}`);
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Playlists</Text>
          <Text style={styles.subhead}>Create sets for drives, workouts, and late-night deep dives.</Text>
        </View>
        <Pressable onPress={() => setIsCreating(true)} style={styles.addButton}>
          <Plus color={colors.text} size={22} />
        </Pressable>
      </View>

      {playlists.length ? (
        <View style={styles.searchWrap}>
          <Search color={colors.textMuted} size={20} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search playlists"
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
        data={filteredPlaylists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, !filteredPlaylists.length && styles.emptyList]}
        ListEmptyComponent={
          <EmptyState
            icon={ListMusic}
            title={query ? 'No playlists found' : 'No playlists yet'}
            message={query ? 'Try another playlist name.' : 'Tap plus to create your first collection.'}
          />
        }
        renderItem={({ item }) => (
          <Pressable style={styles.playlistRow} onPress={() => router.push(`/playlist/${item.id}`)}>
            <View style={styles.playlistIcon}>
              <ListMusic color={colors.primarySoft} size={24} />
            </View>
            <View style={styles.playlistCopy}>
              <Text style={styles.playlistName}>{item.name}</Text>
              <Text style={styles.playlistMeta}>{item.songIds.length} songs</Text>
            </View>
            <Pressable onPress={() => deletePlaylist(item.id)} hitSlop={12} style={styles.deleteButton}>
              <Trash2 color={colors.textDim} size={20} />
            </Pressable>
          </Pressable>
        )}
      />

      <Modal visible={isCreating} transparent animationType="fade" onRequestClose={() => setIsCreating(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New playlist</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Playlist name"
              placeholderTextColor={colors.textDim}
              style={styles.input}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setIsCreating(false)} style={styles.secondaryAction}>
                <Text style={styles.secondaryText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={savePlaylist} style={styles.primaryAction}>
                <Text style={styles.primaryText}>Create</Text>
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
    justifyContent: 'space-between',
    gap: spacing.md,
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
    maxWidth: 270,
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
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
    paddingHorizontal: spacing.md,
    paddingBottom: 196,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 76,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.panel,
  },
  playlistIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.14)',
  },
  playlistCopy: {
    flex: 1,
  },
  playlistName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  playlistMeta: {
    color: colors.textMuted,
    marginTop: 4,
  },
  deleteButton: {
    padding: spacing.sm,
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
});

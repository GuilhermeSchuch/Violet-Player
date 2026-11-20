# Violet Player Agent Context

This file is the repository handoff for AI coding agents and other contributors. Read it together with [README.md](README.md) before making changes.

## Project Snapshot

- Expo SDK 56 preview, React Native 0.85, TypeScript, Expo Router, and Zustand.
- Android-first local MP3 player. The current folder picker and scanner use Android Storage Access Framework.
- Audio playback and the background media session use `react-native-track-player` 4.1.2.
- Native Android and iOS directories are generated and ignored by Git; native patches and Expo config live in the repository.

## Important Paths

- `app/(tabs)/index.tsx`: Library search, folder selection, and song playback entry point.
- `app/(tabs)/playlists.tsx`, `app/playlist/[id].tsx`: playlist browsing and editing.
- `app/(tabs)/settings.tsx`: folder selection and rescanning.
- `app/player.tsx`: full player UI.
- `app/_layout.tsx`: app shell, startup permission flow, and global modals.
- `src/services/libraryScanner.ts`: folder picker, MP3 scan, and filename parsing.
- `src/services/player.ts`, `src/services/playbackService.ts`: TrackPlayer setup, queue loading, and remote controls.
- `src/services/songGain.ts`: dB gain conversion and native gain integration.
- `src/store/libraryStore.ts`: folder scan state and saved folder URI.
- `src/store/playlistStore.ts`: manual and generated artist playlists.
- `src/store/playerStore.ts`: queue and playback state.
- `src/store/songGainStore.ts`: persisted per-song gain settings.
- `src/components/ArtistPlaylistConfirmationModal.tsx`: custom artist-playlist opt-in dialog.
- `patches/react-native-track-player+4.1.2.patch`: Android TrackPlayer patch, including per-track gain support.
- `plugins/with-old-architecture.js`: Expo config plugin needed by the native setup.

## Behavior Contracts

- MP3 metadata is derived from filenames using `Band - Song Name.mp3`; see `src/utils/format.ts`.
- Selecting a song from a filtered Library or playlist starts at that song while preserving the full source collection as the queue.
- Artist playlists are generated only after the user confirms the prompt shown after choosing a folder. Startup validation and rescans update existing generated playlists but do not create new ones.
- Song gain is stored by song ID and expressed from `-20 dB` to `+20 dB`. On Android the TrackPlayer patch applies gain to the active media item. Keep changes per-track; do not replace this with a shared app-wide volume preference.
- `TrackPlayer.registerPlaybackService` must remain registered in `index.ts` before Expo Router entry.
- After changing TrackPlayer native behavior, inspect and update the matching patch under `patches/`; `patch-package` applies it during `postinstall`.
- `src/services/libraryScanner.ts` intentionally rejects folder selection on non-Android platforms until a document-provider import workflow exists.

## State and Persistence

- Zustand stores use AsyncStorage persistence.
- The library store persists only the selected folder URI; song rows are rescanned after startup.
- Playlist data persists in `violet-playlists`.
- Per-song gain persists in `violet-song-gain`.
- Playback queue state is in memory and synchronized with TrackPlayer events from `app/_layout.tsx`.

## Development Commands

```bash
npm install
npm run prebuild
npm run android
npm run dev
npm run typecheck
```

`npm run android` builds and launches the local Android development client. `npm run dev` starts Metro for an installed development client. `npm run build:dev:android` is the EAS development-build option.

There is no test script in `package.json`; `npm run typecheck` is the configured automated check.

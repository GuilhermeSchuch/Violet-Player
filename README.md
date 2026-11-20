# Violet Player

A local MP3 player for people who want their music without ads.

## Features

- Choose a local music folder on Android through the Storage Access Framework.
- Scan MP3 files and parse filenames in `Band - Song Name.mp3` format.
- Search the library and playlists. Starting a song from search keeps the full library or playlist in the playback queue.
- Create and manage playlists. Artist playlists are offered after choosing a folder and are created only after confirmation.
- Adjust gain for an individual song in decibels. The setting is saved per song.
- Background playback, lock-screen and notification controls, and headset controls through `react-native-track-player`.

## Requirements

- Node.js and npm.
- Android Studio, Android SDK, and a connected Android device or emulator for local Android builds.
- A development build. `react-native-track-player` does not run in Expo Go.

## Run on Android

Install dependencies and generate the native Android project:

```bash
npm install
npm run prebuild
```

Build and launch the development app:

```bash
npm run android
```

For later JavaScript-only iterations, start Metro for the development client:

```bash
npm run dev
```

The EAS development build command is also available as `npm run build:dev:android`; it requires EAS CLI configuration and an Expo account.

## Use the App

1. Choose a folder containing MP3 files from Library or Settings.
2. Name files `Band - Song Name.mp3` so the artist and title can be read from the filename.
3. After scanning, choose whether to create playlists for artists with multiple songs.
4. Tap a song to play it, search to find a starting track, or use Shuffle.
5. Pull down on Library to rescan the selected folder.

## Permissions and Platform Notes

Android requests audio-file access and notification access where required by the OS. Folder access is granted through Android's Storage Access Framework.

The folder scanner currently supports Android only. On iOS, the app explains that files need to be imported into the app sandbox, but a document-provider import flow is not implemented. iOS builds also need the native development workflow and are not covered by the Android folder-import steps above.

## Checks

```bash
npm run typecheck
```

## Project Handoff

See [AGENTS.md](AGENTS.md) for the app architecture, important behavior contracts, and notes for AI coding agents continuing development.

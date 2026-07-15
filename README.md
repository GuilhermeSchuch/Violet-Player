# Violet Player

MP3 player because i don't have signatures and i don't like ads.

## Features

- Android folder selection with Storage Access Framework.
- MP3 scanning and filename parsing for `Band - Song Name.mp3`.
- Optimized library list with pull-to-refresh and active track highlighting.
- Playlists CRUD.
- Persistent mini-player that expands into the full player.
- Background playback, lock screen controls, notification controls, and headset controls through `react-native-track-player`.

## Development Build

`react-native-track-player` requires native code, so use a development build instead of Expo Go.

```bash
npm install
npm run build:dev:android
npm run build:dev:ios
npm run dev
```

For local native projects:

```bash
npm run prebuild
npx expo run:android
npx expo run:ios
```

## Permissions

Android:

- `READ_MEDIA_AUDIO` for Android 13+ audio access.
- `READ_EXTERNAL_STORAGE` for older Android versions.
- `FOREGROUND_SERVICE` and `FOREGROUND_SERVICE_MEDIA_PLAYBACK` for background playback.
- `POST_NOTIFICATIONS` for Android 13+ media notifications.
- `WAKE_LOCK` to keep playback stable while locked.

iOS:

- `UIBackgroundModes` includes `audio`.
- Folder picking is platform-limited. The implemented folder scanner uses Android SAF. For a production iOS local-library workflow, import files into the app sandbox or add a document-provider based import flow.

## Usage

1. Install a development build on a device.
2. Open Settings or Library and choose a music folder.
3. Place files in the format `Band - Song Name.mp3`.
4. Pull the Library screen to rescan.
5. Tap any song to start playback.
6. Use playlists to build collections.

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

import { Song } from '../types/music';
import { getDisplayFileName, makeId, parseSongFileName } from '../utils/format';

const mp3Pattern = /\.mp3$/i;

export async function requestMusicFolder() {
  if (Platform.OS !== 'android') {
    throw new Error('Folder access uses Android Storage Access Framework. On iOS, import files through the Files app into the app sandbox.');
  }

  const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

  if (!permissions.granted) {
    return null;
  }

  return permissions.directoryUri;
}

export async function scanMusicFolder(folderUri: string): Promise<Song[]> {
  const entries = await FileSystem.StorageAccessFramework.readDirectoryAsync(folderUri);
  const songs = entries
    .filter((uri) => mp3Pattern.test(getDisplayFileName(uri)))
    .map((uri) => {
      const fileName = getDisplayFileName(uri) || 'Unknown.mp3';
      const metadata = parseSongFileName(fileName);

      return {
        id: makeId(uri),
        uri,
        fileName,
        title: metadata.title,
        artist: metadata.artist,
      };
    })
    .sort((a, b) => a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title));

  return songs;
}

export function parseSongFileName(fileName: string) {
  const clean = getDisplayFileName(fileName).replace(/\.mp3$/i, '').trim();
  const match = clean.match(/^(.+?)\s+-\s+(.+)$/);

  if (!match) {
    return { artist: 'Unknown Artist', title: clean || 'Untitled' };
  }

  return {
    artist: match[1]?.trim() || 'Unknown Artist',
    title: match[2]?.trim() || 'Untitled',
  };
}

export function getDisplayFileName(uriOrName: string) {
  const decoded = decodeURIComponent(uriOrName).replace(/\\/g, '/');
  const afterSlash = decoded.split('/').filter(Boolean).pop() ?? decoded;
  const afterTreePrefix = afterSlash.includes(':') ? afterSlash.split(':').pop() : afterSlash;

  return (afterTreePrefix ?? afterSlash).trim();
}

export function formatTime(seconds = 0) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;

  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function makeId(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

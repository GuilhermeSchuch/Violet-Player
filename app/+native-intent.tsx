type NativeIntent = {
  path: string;
  initial: boolean;
};

export function redirectSystemPath({ path }: NativeIntent) {
  if (path.includes('notification.click')) {
    return '/player';
  }

  return path;
}

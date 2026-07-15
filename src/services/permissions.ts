import { Permission, PermissionsAndroid, Platform } from 'react-native';

type PermissionRequirement = {
  permission: Permission;
  label: string;
};

export async function requestStartupPermissions() {
  if (Platform.OS !== 'android') {
    return [];
  }

  const androidVersion = Number(Platform.Version);
  const requirements: PermissionRequirement[] = [
    androidVersion >= 33
      ? {
          permission: PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
          label: 'music and audio access',
        }
      : {
          permission: PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          label: 'storage access',
        },
  ];

  if (androidVersion >= 33) {
    requirements.push({
      permission: PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      label: 'notification access',
    });
  }

  const missingRequirements: PermissionRequirement[] = [];

  for (const requirement of requirements) {
    if (!(await PermissionsAndroid.check(requirement.permission))) {
      missingRequirements.push(requirement);
    }
  }

  if (!missingRequirements.length) {
    return [];
  }

  const statuses = await PermissionsAndroid.requestMultiple(
    missingRequirements.map(({ permission }) => permission),
  );

  return missingRequirements
    .filter(({ permission }) => statuses[permission] !== PermissionsAndroid.RESULTS.GRANTED)
    .map(({ label }) => label);
}

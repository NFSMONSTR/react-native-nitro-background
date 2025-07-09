import type { HybridObject } from 'react-native-nitro-modules';
import type { NitroBackgroundNotificationOptions } from './types';

export interface NitroBackground
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  start(
    taskKey: string,
    notificationOptions: NitroBackgroundNotificationOptions,
    onExpire?: () => void
  ): void;

  updateNotification(
    taskKey: string,
    options: NitroBackgroundNotificationOptions
  ): void;

  stop(taskKey: string): void;
}

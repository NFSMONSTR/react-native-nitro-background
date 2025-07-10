interface TaskIconOptions {
  name: string;
  type: string;
  icon_package?: string;
}

interface ProgressBarOptions {
  max: number;
  value: number;
  indeterminate?: boolean;
}

export interface NitroBackgroundNotificationOptions {
  channelName?: string;
  channelDescription?: string;
  channelId?: string;
  taskTitle?: string;
  taskDesc?: string;
  taskIcon?: TaskIconOptions;
  color?: string;
  linkingURI?: string;
  progressBar?: ProgressBarOptions;
}

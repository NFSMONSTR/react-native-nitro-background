import { NitroModules } from 'react-native-nitro-modules';
import type { NitroBackground } from './NitroBackground.nitro';
import type { NitroBackgroundNotificationOptions } from './types';
import { AppRegistry, Platform } from 'react-native';

const NitroBackgroundHybridObject =
  NitroModules.createHybridObject<NitroBackground>('NitroBackground');

class NitroBackgroundService {
  private runningTasks: Set<string>;
  private tasksInfo: Record<
    string,
    {
      nativeKey?: string;
      stopTaskPromise?: (arg?: any) => void;
      notificationParams?: NitroBackgroundNotificationOptions;
    }
  >;
  private tasksCounter: number;

  constructor() {
    this.runningTasks = new Set<string>();
    this.tasksInfo = {};
    this.tasksCounter = 0;
  }

  private generateTask<T>(
    taskKey: string,
    task: (taskData?: T) => Promise<void>,
    parameters?: T
  ) {
    const self = this;
    return async () => {
      await new Promise<void>((resolve) => {
        if (!self.tasksInfo?.[taskKey]) {
          self.tasksInfo[taskKey] = {};
        }
        self.tasksInfo[taskKey].stopTaskPromise = resolve;
        task(parameters).then(() => {
          self.stop(taskKey);
        });
      });
    };
  }

  public isRunning(taskKey: string) {
    return this.runningTasks.has(taskKey);
  }

  public start<T>(
    taskKey: string,
    task: (taskData?: T) => Promise<void>,
    options: {
      parameters?: T;
      notificationOptions: NitroBackgroundNotificationOptions;
      onExpire?: () => void;
    }
  ): void {
    if (this.runningTasks.has(taskKey)) {
      this.stop(taskKey);
      return;
    }
    this.tasksCounter++;
    const newTask = this.generateTask(taskKey, task, options?.parameters);
    const nativeTaskKey = `${taskKey}-${this.tasksCounter}`;
    const notificationOptions: NitroBackgroundNotificationOptions = {
      ...(options?.notificationOptions ?? {}),
      channelId: options?.notificationOptions?.channelId ?? taskKey,
    };
    if (Platform.OS === 'android') {
      AppRegistry.registerHeadlessTask(nativeTaskKey, () => newTask);
    }
    this.runningTasks.add(taskKey);
    if (!this.tasksInfo[taskKey]) {
      this.tasksInfo[taskKey] = {};
    }
    this.tasksInfo[taskKey] = {
      nativeKey: nativeTaskKey,
      notificationParams: notificationOptions,
    };
    NitroBackgroundHybridObject.start(
      nativeTaskKey,
      notificationOptions,
      options.onExpire
    );
    if (Platform.OS === 'ios') {
      newTask();
    }
  }

  public updateNotification(
    taskKey: string,
    notificationOptions: NitroBackgroundNotificationOptions
  ) {
    if (Platform.OS !== 'android') {
      return;
    }
    if (!this.runningTasks.has(taskKey)) {
      return;
    }
    if (!this.tasksInfo[taskKey]?.nativeKey) {
      return;
    }

    const nativeTaskKey = this.tasksInfo[taskKey]?.nativeKey;
    this.tasksInfo[taskKey].notificationParams = {
      ...(this.tasksInfo[taskKey].notificationParams ?? {}),
      ...notificationOptions,
    };

    NitroBackgroundHybridObject.updateNotification(
      nativeTaskKey,
      this.tasksInfo[taskKey].notificationParams
    );
  }

  public stop(taskKey: string) {
    const taskInfo = this.tasksInfo[taskKey];
    if (taskInfo?.stopTaskPromise) {
      taskInfo?.stopTaskPromise();
    }
    if (this.runningTasks.has(taskKey)) {
      const nativeTaskKey = taskInfo?.nativeKey;
      if (nativeTaskKey) {
        NitroBackgroundHybridObject.stop(nativeTaskKey);
      }
      this.runningTasks.delete(taskKey);
    }
    if (taskInfo) {
      delete this.tasksInfo[taskKey];
    }
  }

  public stopAll() {
    for (const taskKey of this.runningTasks.keys()) {
      if (this.tasksInfo[taskKey]?.stopTaskPromise) {
        this.tasksInfo[taskKey]?.stopTaskPromise();
      }
      const nativeTaskKey = this.tasksInfo[taskKey]?.nativeKey;
      if (nativeTaskKey) {
        NitroBackgroundHybridObject.stop(nativeTaskKey);
      }
    }
    this.runningTasks.clear();
    this.tasksInfo = {};
  }
}

const backgroundService = new NitroBackgroundService();

export default backgroundService;

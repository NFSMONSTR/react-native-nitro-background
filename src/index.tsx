import { NitroModules } from 'react-native-nitro-modules';
import type { NitroBackground } from './NitroBackground.nitro';
import type { NitroBackgroundNotificationOptions } from './types';
import { AppRegistry, Platform } from 'react-native';

const NitroBackgroundHybridObject =
  NitroModules.createHybridObject<NitroBackground>('NitroBackground');

class NitroBackgroundService {
  private runningTasks: Set<string>;
  private nativeTaskKeys: Record<string, string>;
  private tasksCounter: number;
  private stopTasksPromises: Record<string, (arg?: any) => void>;
  private notificationParams: Record<
    string,
    NitroBackgroundNotificationOptions
  >;

  constructor() {
    this.runningTasks = new Set<string>();
    this.stopTasksPromises = {};
    this.notificationParams = {};
    this.nativeTaskKeys = {};
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
        self.stopTasksPromises[taskKey] = resolve;
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
      this.notificationParams[taskKey] = notificationOptions;
    }
    this.runningTasks.add(taskKey);
    this.nativeTaskKeys[taskKey] = nativeTaskKey;
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
    if (!this.nativeTaskKeys[taskKey]) {
      return;
    }

    const nativeTaskKey = this.nativeTaskKeys[taskKey];

    NitroBackgroundHybridObject.updateNotification(nativeTaskKey, {
      ...(this.notificationParams?.[taskKey] ?? {}),
      ...notificationOptions,
    });
  }

  public stop(taskKey: string) {
    if (this?.stopTasksPromises?.[taskKey]) {
      this?.stopTasksPromises?.[taskKey]();
      delete this?.stopTasksPromises[taskKey];
    }
    if (taskKey in this.notificationParams) {
      delete this.notificationParams[taskKey];
    }
    if (this.runningTasks.has(taskKey)) {
      const nativeTaskKey = this?.nativeTaskKeys[taskKey];
      if (nativeTaskKey) {
        NitroBackgroundHybridObject.stop(nativeTaskKey);
        delete this.nativeTaskKeys[taskKey];
      }
      this.runningTasks.delete(taskKey);
    }
  }

  public stopAll() {
    for (const taskKey of this.runningTasks.keys()) {
      if (this?.stopTasksPromises?.[taskKey]) {
        this?.stopTasksPromises?.[taskKey]();
        delete this?.stopTasksPromises[taskKey];
      }
      const nativeTaskKey = this?.nativeTaskKeys[taskKey];
      if (nativeTaskKey) {
        NitroBackgroundHybridObject.stop(nativeTaskKey);
      }
    }
    this.runningTasks.clear();
    this.notificationParams = {};
    this.nativeTaskKeys = {};
  }
}

const backgroundService = new NitroBackgroundService();

export default backgroundService;

import { NitroModules } from 'react-native-nitro-modules';
import type { NitroBackground } from './NitroBackground.nitro';
import type { NitroBackgroundNotificationOptions } from './types';
import { AppRegistry, Platform } from 'react-native';

const NitroBackgroundHybridObject =
  NitroModules.createHybridObject<NitroBackground>('NitroBackground');

class NitroBackgroundService {
  private runningTasks: Set<string>;
  private stopTasksPromises: Record<string, (arg?: any) => void>;

  constructor() {
    this.runningTasks = new Set<string>();
    this.stopTasksPromises = {};
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

    const newTask = this.generateTask(taskKey, task, options?.parameters);
    if (Platform.OS === 'android') {
      AppRegistry.registerHeadlessTask(taskKey, () => newTask);
    }
    this.runningTasks.add(taskKey);
    NitroBackgroundHybridObject.start(
      taskKey,
      options.notificationOptions,
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
      //todo error?
      return;
    }
    //todo save notification options
    NitroBackgroundHybridObject.updateNotification(
      taskKey,
      notificationOptions
    );
  }

  public stop(taskKey: string) {
    if (this?.stopTasksPromises?.[taskKey]) {
      this?.stopTasksPromises?.[taskKey]();
      delete this?.stopTasksPromises[taskKey];
    }
    NitroBackgroundHybridObject.stop(taskKey);
    if (this.runningTasks.has(taskKey)) {
      this.runningTasks.delete(taskKey);
    }
  }

  public stopAll() {
    for (const taskKey of this.runningTasks.keys()) {
      if (this?.stopTasksPromises?.[taskKey]) {
        this?.stopTasksPromises?.[taskKey]();
        delete this?.stopTasksPromises[taskKey];
      }
      NitroBackgroundHybridObject.stop(taskKey);
    }
    this.runningTasks.clear();
  }
}

const backgroundService = new NitroBackgroundService();

export default backgroundService;

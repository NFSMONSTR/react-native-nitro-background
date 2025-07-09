import {
  Text,
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import BackgroundService from '@nfsmonstr/react-native-nitro-background';
import { useRef } from 'react';

const TASK_1_NAME = 'TASK_1';
const TASK_2_NAME = 'TASK_2';

const sleep = (time: any) =>
  new Promise<void>((resolve) => setTimeout(() => resolve(), time));

const taskRandom = async (taskData: any) => {
  if (Platform.OS === 'ios') {
    console.warn(
      'This task will not keep your app alive in the background by itself, use other library like react-native-track-player that use audio,',
      'geolocalization, etc. to keep your app alive in the background while you excute the JS from this library.'
    );
  }
  await new Promise(async (resolve) => {
    // For loop with a delay
    const { delay, taskName } = taskData;
    console.log(BackgroundService.isRunning(taskName), delay);
    for (let i = 0; BackgroundService.isRunning(taskName); i++) {
      console.log('Runned -> ', i);
      BackgroundService.updateNotification(taskName, {
        taskDesc: 'Runned -> ' + i,
      });
      await sleep(delay);
    }
  });
};

const options_1 = {
  notificationOptions: {
    taskTitle: 'ExampleTask1 title',
    taskDesc: 'ExampleTask desc',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#ff00ff',
    linkingURI: 'exampleScheme://chat/jane',
  },
  parameters: {
    delay: 1000,
    taskName: TASK_1_NAME,
  },
};

const options_2 = {
  notificationOptions: {
    taskTitle: 'ExampleTask2 title',
    taskDesc: 'ExampleTask desc',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#ff00ff',
    linkingURI: 'exampleScheme://chat/jane',
  },
  parameters: {
    delay: 2000,
    taskName: TASK_2_NAME,
  },
};

export default function App() {
  let running = useRef(
    BackgroundService.isRunning(TASK_1_NAME) ||
      BackgroundService.isRunning(TASK_2_NAME)
  );

  /**
   * Toggles the background task
   */
  const toggleBackground = async () => {
    running.current = !running.current;
    if (running.current) {
      try {
        console.log('Trying to start background service');
        BackgroundService.start(TASK_1_NAME, taskRandom, options_1);
        BackgroundService.start(TASK_2_NAME, taskRandom, options_2);
        console.log('Successful start!');
      } catch (e) {
        console.log('Error', e);
      }
    } else {
      console.log('Stop background service');
      BackgroundService.stop(TASK_1_NAME);
      BackgroundService.stop(TASK_2_NAME);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={toggleBackground}
        style={{ width: 100, height: 40 }}
      >
        <Text>{'Toggle'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});

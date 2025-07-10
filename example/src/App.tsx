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
  await new Promise(async (_) => {
    // For loop with a delay
    const { delay, taskKey } = taskData;
    console.log(BackgroundService.isRunning(taskKey), delay);
    for (let i = 0; BackgroundService.isRunning(taskKey); i++) {
      console.log(taskKey, ' Runned -> ', i);
      BackgroundService.updateNotification(taskKey, {
        taskTitle: taskKey + ' Runned -> ' + i,
      });
      await sleep(delay);
    }
  });
};

const options_1 = {
  notificationOptions: {
    channelName: 'Task 1 channel',
    channelDescription: 'Task 1 channel description',
    taskTitle: 'ExampleTask1 title',
    taskDesc: 'ExampleTask desc',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#00FF00',
    linkingURI: 'exampleScheme://chat/jane',
  },
  parameters: {
    delay: 1000,
    taskKey: TASK_1_NAME,
  },
};

const options_2 = {
  notificationOptions: {
    channelName: 'Task 2 channel',
    channelDescription: 'Task 2 channel description',
    taskTitle: 'ExampleTask2 title',
    taskDesc: 'ExampleTask desc',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#0000FF',
    linkingURI: 'exampleScheme://chat/jane',
  },
  parameters: {
    delay: 2000,
    taskKey: TASK_2_NAME,
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
      <TouchableOpacity onPress={toggleBackground} style={styles.button}>
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
  button: {
    width: '60%',
    height: 60,
    borderRadius: 5,
    backgroundColor: '#418c41',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

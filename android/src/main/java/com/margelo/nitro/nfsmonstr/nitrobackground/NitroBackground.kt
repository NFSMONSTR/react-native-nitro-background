package com.margelo.nitro.nfsmonstr.nitrobackground

import NitroBackgroundNotificationOptionsInternal
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import java.util.concurrent.atomic.AtomicInteger

const val SERVICE_ID = "SERVICE_ID"
const val NOTIFICATION_OPTIONS = "NOTIFICATION_OPTIONS"

@DoNotStrip
class NitroBackground(private val reactContext: ReactApplicationContext) : HybridNitroBackgroundSpec() {
  private var runningTasks: HashMap<String, Intent> = HashMap();
  var serviceIdCounter: AtomicInteger = AtomicInteger(0);

  fun getId(): Int {
    return serviceIdCounter.incrementAndGet();
  }

  override fun start(
    taskKey: String,
    notificationOptions: NitroBackgroundNotificationOptions,
    onExpire: (() -> Unit)?
  ) {
    if (taskKey in runningTasks) {
      reactContext.stopService(runningTasks[taskKey])
    }

    val serviceIntent = Intent(reactContext, RNNitroBackgroundTask.Companion::class.java)
    serviceIntent.putExtra(SERVICE_ID, getId())
    val options = NitroBackgroundNotificationOptionsInternal(reactContext, notificationOptions)
    serviceIntent.putExtra(NOTIFICATION_OPTIONS, options.extras)
    reactContext.startService(serviceIntent)
    runningTasks[taskKey] = serviceIntent
  }

  override fun stop(taskKey: String) {
    if (taskKey in runningTasks) {
      reactContext.stopService(runningTasks[taskKey])
      runningTasks.remove(taskKey)
    }
  }

  override fun updateNotification(taskKey: String, options: NitroBackgroundNotificationOptions) {
    if (taskKey !in runningTasks) {
      return
    }
    val serviceId: Int? = runningTasks[taskKey]?.getIntExtra(SERVICE_ID, 0)
    if (serviceId == 0 || serviceId == null) {
      return
    }
    val optionsInternal = NitroBackgroundNotificationOptionsInternal(reactContext, options)
    val notification = RNNitroBackgroundTask.buildNotification(reactContext, optionsInternal)
    val notificationManager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    notificationManager.notify(serviceId, notification)
  }
}

package com.margelo.nitro.nfsmonstr.nitrobackground

import NitroBackgroundNotificationOptionsInternal
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.bridge.ReactApplicationContext
import java.util.concurrent.atomic.AtomicInteger
import com.margelo.nitro.NitroModules


const val SERVICE_ID = "SERVICE_ID"
const val NOTIFICATION_OPTIONS = "NOTIFICATION_OPTIONS"
const val TASK_KEY = "TASK_KEY"

@Keep
@DoNotStrip
class NitroBackground :
  HybridNitroBackgroundSpec() {
  private val reactContext: ReactApplicationContext
    get() = NitroModules.applicationContext ?: throw Error("No context - NitroModules.applicationContext was null!")
  private var runningTasks: HashMap<String, Pair<Intent, Int>> = HashMap()
  private var serviceIdCounter: AtomicInteger = AtomicInteger(0)

  fun getId(): Int {
    return serviceIdCounter.incrementAndGet();
  }

  override fun start(
    taskKey: String,
    notificationOptions: NitroBackgroundNotificationOptions,
    onExpire: (() -> Unit)?
  ) {
    try {

      if (taskKey in runningTasks) {
        reactContext.stopService(runningTasks[taskKey]?.first)
      }
      val serviceId = getId()
      val serviceIntent = Intent(reactContext, RNNitroBackgroundTask::class.java).apply {
        putExtra(SERVICE_ID, serviceId)
        putExtra(TASK_KEY, taskKey)
        val options = NitroBackgroundNotificationOptionsInternal(reactContext, notificationOptions)
        putExtra(NOTIFICATION_OPTIONS, options.extras)
      }

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        reactContext.startForegroundService(serviceIntent)
      } else {
        reactContext.startService(serviceIntent)
      }
      runningTasks[taskKey] = Pair(serviceIntent, serviceId)
    } catch (e: Exception){
      throw Error("Failed to start background task "+ taskKey + ": " + e.message)
    }
  }

  override fun stop(taskKey: String) {
    try {
      runningTasks[taskKey]?.let { (intent, serviceId) ->
        reactContext.stopService(intent)
        val notificationManager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(serviceId)
        runningTasks.remove(taskKey)
      }
    } catch (e: Exception) {
      throw Error("Failed to stop background task "+ taskKey + ": " + e.message)
    }
  }

  override fun updateNotification(taskKey: String, options: NitroBackgroundNotificationOptions) {
    try {
      runningTasks[taskKey]?.let { (_, serviceId) ->
        Log.d("NITRO BACKGROUND", "updateNotification: "+taskKey+ " sericeId "+serviceId.toString())

        val optionsInternal = NitroBackgroundNotificationOptionsInternal(reactContext, options)
        val notification = RNNitroBackgroundTask.buildNotification(reactContext, optionsInternal)
        val notificationManager =
          reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(serviceId, notification)
      }
    } catch (e: Exception) {
      throw Error("Failed to update notification for task "+ taskKey + ": " + e.message)
    }
  }
}

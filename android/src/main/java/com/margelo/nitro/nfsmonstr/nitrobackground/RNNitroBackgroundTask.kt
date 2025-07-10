package com.margelo.nitro.nfsmonstr.nitrobackground

import NitroBackgroundNotificationOptionsInternal
import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import androidx.annotation.Nullable
import androidx.core.app.NotificationCompat
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig


class RNNitroBackgroundTask : HeadlessJsTaskService() {
  private val TAG = "RNNitroBackgroundTask"
  private var id: Int? = null

  @Nullable
  override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
    val extras = intent?.extras
    if (extras != null) {
      return HeadlessJsTaskConfig(
        intent.getStringExtra(TASK_KEY)!!,
        Arguments.fromBundle(extras),
        0,
        true
      )
    }
    return null
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val id = intent?.getIntExtra(SERVICE_ID, 0) ?: 0
    this.id = id

    val extras = intent?.getBundleExtra(NOTIFICATION_OPTIONS) ?: Bundle()

    val options = NitroBackgroundNotificationOptionsInternal(extras)


    createNotificationChannel(
          getUniqueChannelId(options.channelId),
      options.channelName ?: options.taskTitle,
      options.channelDescription ?: options.taskDesc
    ) // Necessary creating channel for API 26+


    // Create the notification
    val notification = buildNotification(this, options)
    startForeground(id, notification)

    return super.onStartCommand(intent, flags, startId)
  }

  private fun createNotificationChannel(channelId: String, title: String, description: String) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val importance = NotificationManager.IMPORTANCE_LOW
      val channel = NotificationChannel(channelId, title, importance)
      channel.description = description
      val notificationManager = getSystemService(
        NotificationManager::class.java
      )
      notificationManager.createNotificationChannel(channel)
    }
  }

  companion object {

    private fun getUniqueChannelId(channelId: String): String {
      return "RN_BACKGROUND_ACTIONS_CHANNEL_${channelId}"
    }


    @SuppressLint("UnspecifiedImmutableFlag")
    fun buildNotification(context: Context, notificationOptions: NitroBackgroundNotificationOptionsInternal): Notification {
      // Get info
      val taskTitle: String? = notificationOptions.taskTitle
      val taskDesc: String? = notificationOptions.taskDesc
      val iconInt: Int = notificationOptions.iconInt
      val color: Int = notificationOptions.color
      val linkingURI: String? = notificationOptions.linkingURI
      val notificationIntent = if (linkingURI != null) {
        Intent(Intent.ACTION_VIEW, Uri.parse(linkingURI))
      } else {
        //as RN works on single activity architecture - we don't need to find current activity on behalf of react context
        Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
      }
      val contentIntent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
        PendingIntent.getActivity(
          context,
          0,
          notificationIntent,
          PendingIntent.FLAG_MUTABLE or PendingIntent.FLAG_ALLOW_UNSAFE_IMPLICIT_INTENT
        )
      } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        PendingIntent.getActivity(context, 0, notificationIntent, PendingIntent.FLAG_MUTABLE)
      } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        PendingIntent.getActivity(
          context,
          0,
          notificationIntent,
          PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
      } else {
        PendingIntent.getActivity(context, 0, notificationIntent, PendingIntent.FLAG_UPDATE_CURRENT)
      }
      val channelId = notificationOptions.channelId
      val builder = NotificationCompat.Builder(context, getUniqueChannelId(channelId))
        .setContentTitle(taskTitle)
        .setContentText(taskDesc)
        .setSmallIcon(iconInt)
        .setContentIntent(contentIntent)
        .setOngoing(true)
        .setPriority(NotificationCompat.PRIORITY_MIN)
        .setColor(color)

      val progressBarBundle: Bundle? = notificationOptions.progressBar
      if (progressBarBundle != null) {
        val progressMax = progressBarBundle.getInt("max")
        val progressCurrent = progressBarBundle.getInt("value")
        val progressIndeterminate = progressBarBundle.getBoolean("indeterminate")
        builder.setProgress(progressMax, progressCurrent, progressIndeterminate)
      }
      return builder.build()
    }
  }
}

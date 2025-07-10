
import android.graphics.Color
import android.os.Bundle
import androidx.annotation.ColorInt
import androidx.annotation.IdRes
import androidx.annotation.Nullable
import com.facebook.react.bridge.ReactContext
import com.margelo.nitro.nfsmonstr.nitrobackground.NitroBackgroundNotificationOptions

class NitroBackgroundNotificationOptionsInternal {
  val extras: Bundle?

  constructor(extras: Bundle) {
    this.extras = extras
  }

  constructor(reactContext: ReactContext, options: NitroBackgroundNotificationOptions) {
    // Create extras
    extras = Bundle()
    requireNotNull(options) { "Could not convert arguments to bundle" }
    // Get taskTitle
    try {
      requireNotNull(options.taskTitle)
      extras.putString("taskTitle", options.taskTitle)
    } catch (e: Exception) {
      throw IllegalArgumentException("Task title cannot be null")
    }
    // Get taskDesc
    try {
      requireNotNull(options.taskDesc)
      extras.putString("taskDesk", options.taskDesc)
    } catch (e: Exception) {
      throw IllegalArgumentException("Task description cannot be null")
    }
    //get Channel Id
    try {
      requireNotNull(options.channelId)
      extras.putString("channelId", options.channelId)
    } catch (e: Exception) {
      throw IllegalArgumentException("channel id cannot be null")
    }
    // Get iconInt
    try {
      val iconObject = options.taskIcon
      requireNotNull(iconObject)
      val iconName = iconObject.name
      val iconType = iconObject.type
      var iconPackage: String?
      try {
        iconPackage = iconObject.icon_package
        requireNotNull(iconPackage)
      } catch (e: Exception) {
        // Get the current package as default
        iconPackage = reactContext.packageName
      }
      val iconInt = reactContext.resources.getIdentifier(iconName, iconType, iconPackage)
      extras.putInt("iconInt", iconInt)
      require(iconInt != 0)
    } catch (e: Exception) {
      throw IllegalArgumentException("Task icon not found")
    }
    // Get color
    try {
      val color = options.color
      extras.putInt("color", Color.parseColor(color))
    } catch (e: Exception) {
      extras.putInt("color", Color.parseColor("#ffffff"))
    }
    //Get progress bar
    if (options.progressBar !== null) {
      try {
        val progressBarBundle = Bundle()
        progressBarBundle.putInt("max", options.progressBar.max.toInt())
        progressBarBundle.putInt("value", options.progressBar.value.toInt())
        progressBarBundle.putBoolean("indeterminate", options.progressBar.indeterminate ?: false)
        extras.putBundle("progressBar", progressBarBundle)
      } catch (_: Exception) {
      }
    }
    //Get linking uri
    if (options.linkingURI!==null) {
      extras.putString("linkingURI", options.linkingURI)
    }

    //Get channel name
    if (options.channelName!= null) {
      extras.putString("channelName", options.channelName)
    }

    //Get channel description
    if (options.channelDescription!= null) {
      extras.putString("channelDescription", options.channelDescription)
    }
  }

  val taskTitle: String
    get() = extras!!.getString("taskTitle", "")

  val taskDesc: String
    get() = extras!!.getString("taskDesc", "")

  @get:IdRes
  val iconInt: Int
    get() = extras!!.getInt("iconInt")

  @get:ColorInt
  val color: Int
    get() = extras!!.getInt("color")

  @get:Nullable
  val linkingURI: String?
    get() = extras!!.getString("linkingURI")

  @get:Nullable
  val progressBar: Bundle?
    get() = extras!!.getBundle("progressBar")
  val channelId: String
    get() = extras!!.getString("channelId", "")
  @get:Nullable
  val channelName: String?
    get() = extras?.getString("channelName")

  @get:Nullable
  val channelDescription: String?
    get() = extras?.getString("channelDescription")
}

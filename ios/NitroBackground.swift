class NitroBackground: HybridNitroBackgroundSpec {
  private var app: UIApplication
  private var runningTasks: [String: UIBackgroundTaskIdentifier] = [:]
  
  override init() {
    self.app = UIApplication.shared
    super.init()
  }
  
  func start(taskKey: String, notificationOptions: NitroBackgroundNotificationOptions, onExpire: (() -> Void)?) throws {
    let taskId = self.app.beginBackgroundTask(withName: taskKey) {
      onExpire?()
      do {
        try self.stop(taskKey: taskKey)
      } catch {
        print("Failed to stop background task \(taskKey): \(error)")
      }
    }
    runningTasks[taskKey] = taskId
  }
  
  func updateNotification(taskKey: String, options: NitroBackgroundNotificationOptions) throws {
    //unused in ios
  }
  
  func stop(taskKey: String) throws {
    if let taskId = runningTasks[taskKey] {
      self.app.endBackgroundTask(taskId)
    }
  }
}

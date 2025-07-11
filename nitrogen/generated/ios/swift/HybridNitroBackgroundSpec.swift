///
/// HybridNitroBackgroundSpec.swift
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

import Foundation
import NitroModules

/// See ``HybridNitroBackgroundSpec``
public protocol HybridNitroBackgroundSpec_protocol: HybridObject {
  // Properties
  

  // Methods
  func start(taskKey: String, notificationOptions: NitroBackgroundNotificationOptions, onExpire: (() -> Void)?) throws -> Void
  func updateNotification(taskKey: String, options: NitroBackgroundNotificationOptions) throws -> Void
  func stop(taskKey: String) throws -> Void
}

/// See ``HybridNitroBackgroundSpec``
public class HybridNitroBackgroundSpec_base {
  private weak var cxxWrapper: HybridNitroBackgroundSpec_cxx? = nil
  public func getCxxWrapper() -> HybridNitroBackgroundSpec_cxx {
  #if DEBUG
    guard self is HybridNitroBackgroundSpec else {
      fatalError("`self` is not a `HybridNitroBackgroundSpec`! Did you accidentally inherit from `HybridNitroBackgroundSpec_base` instead of `HybridNitroBackgroundSpec`?")
    }
  #endif
    if let cxxWrapper = self.cxxWrapper {
      return cxxWrapper
    } else {
      let cxxWrapper = HybridNitroBackgroundSpec_cxx(self as! HybridNitroBackgroundSpec)
      self.cxxWrapper = cxxWrapper
      return cxxWrapper
    }
  }
}

/**
 * A Swift base-protocol representing the NitroBackground HybridObject.
 * Implement this protocol to create Swift-based instances of NitroBackground.
 * ```swift
 * class HybridNitroBackground : HybridNitroBackgroundSpec {
 *   // ...
 * }
 * ```
 */
public typealias HybridNitroBackgroundSpec = HybridNitroBackgroundSpec_protocol & HybridNitroBackgroundSpec_base

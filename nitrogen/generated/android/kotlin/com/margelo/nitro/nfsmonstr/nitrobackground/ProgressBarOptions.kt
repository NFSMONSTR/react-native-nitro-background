///
/// ProgressBarOptions.kt
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

package com.margelo.nitro.nfsmonstr.nitrobackground

import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.core.*

/**
 * Represents the JavaScript object/struct "ProgressBarOptions".
 */
@DoNotStrip
@Keep
data class ProgressBarOptions
  @DoNotStrip
  @Keep
  constructor(
    val max: Double,
    val value: Double,
    val indeterminate: Boolean?
  ) {
  /* main constructor */
}

///
/// NitroBackgroundAutolinking.mm
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#import <Foundation/Foundation.h>
#import <NitroModules/HybridObjectRegistry.hpp>
#import "NitroBackground-Swift-Cxx-Umbrella.hpp"
#import <type_traits>

#include "HybridNitroBackgroundSpecSwift.hpp"

@interface NitroBackgroundAutolinking : NSObject
@end

@implementation NitroBackgroundAutolinking

+ (void) load {
  using namespace margelo::nitro;
  using namespace margelo::nitro::nitrobackground;

  HybridObjectRegistry::registerHybridObjectConstructor(
    "NitroBackground",
    []() -> std::shared_ptr<HybridObject> {
      std::shared_ptr<margelo::nitro::nitrobackground::HybridNitroBackgroundSpec> hybridObject = NitroBackground::NitroBackgroundAutolinking::createNitroBackground();
      return hybridObject;
    }
  );
}

@end

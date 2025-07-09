#include <jni.h>
#include "nitrobackgroundOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::nitrobackground::initialize(vm);
}

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Re.Pack
-keep class com.callstack.repack.** { *; }

# Keychain
-keep class com.oblador.keychain.** { *; }

# SSL Pinning
-keep class com.sslpublickeypinning.** { *; }

# freeRASP / Talsec
-keep class com.aheaditec.talsec.** { *; }
-dontwarn com.aheaditec.talsec.**

# Hermes
-keep class com.facebook.hermes.unicode.** { *; }

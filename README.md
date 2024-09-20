# Arc Browser Pull-to-Refresh Haptics in Expo

This is a simple replication of the pull-to-refresh haptics in the Arc Browser app. When you scroll down the haptics slowly get more intense with a slight punchy feel, sort of like pulling a rubber band. At the apex of the pull, the haptics have a strong punch to indicate that the refresh has been triggered.

This feature is iOS-only and required a Swift module to maintain the haptic engine, the engine is restored when the app is resumed according to the Apple docs: [Updating Continuous and Transient Haptic Parameters in Real Time](https://developer.apple.com/documentation/corehaptics/updating-continuous-and-transient-haptic-parameters-in-real-time).

To run the project:

- `bun install`
- `npx expo run:ios -d` -> choose a physical device

import ExpoModulesCore
import CoreHaptics

public class HapticEngineModule: Module {
    // Each module class must implement the definition function. The definition consists of components
    // that describes the module's functionality and behavior.
    // See https://docs.expo.dev/modules/module-api for more details about available components.
    // Create a property to store the CHHapticEngine instance
    var hapticEngine: CHHapticEngine?
    
    public func definition() -> ModuleDefinition {
        // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
        // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
        // The module will be accessible from `requireNativeModule('HapticEngine')` in JavaScript.
        Name("HapticEngine")

        // Function to create and start the haptic engine
        Function("createEngine") { () -> Void in
            do {
                self.hapticEngine = try CHHapticEngine()
                try self.hapticEngine?.start()
                self.hapticEngine?.resetHandler = {
                    print("Reset Handler: Restarting the engine.")
                    do {
                        try self.hapticEngine?.start()
                    } catch {
                        print("Failed to start the engine")
                    }
                }
            } catch {
                print("Failed to create and start the haptic engine: \(error)")
            }
        }
        
        // Function to stop and destroy the haptic engine
        Function("destroyEngine") { () -> Void in
            self.hapticEngine?.stop()
            self.hapticEngine = nil
        }
        
        // Function to play a haptic pattern
        AsyncFunction("playHapticPattern") { (sharpness: Double, intensity: Double) in
            guard let engine = self.hapticEngine else {
                print("Haptic engine not initialized")
                return
            }
            
            let sharpnessParameter = CHHapticEventParameter(parameterID: .hapticSharpness, value: Float(sharpness))
            let intensityParameter = CHHapticEventParameter(parameterID: .hapticIntensity, value: Float(intensity))
            
            do {
                let event = CHHapticEvent(eventType: .hapticTransient, parameters: [intensityParameter, sharpnessParameter], relativeTime: 0)
                
                let pattern = try CHHapticPattern(events: [event], parameters: [])
                let player = try engine.makePlayer(with: pattern)
                try player.start(atTime: 0)
            } catch {
                print("Failed to play haptic pattern: \(error)")
            }
        }.runOnQueue(.main)
        
    }
}

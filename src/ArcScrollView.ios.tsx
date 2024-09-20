import { useEffect, useRef } from "react";
import {
  AppState,
  Dimensions,
  ScrollView,
  ScrollViewProps,
  Easing,
} from "react-native";

const hap = globalThis.expo?.modules?.HapticEngine as {
  /** Create the haptics engine. */
  createEngine: () => void;
  /** Destroy the engine. */
  destroyEngine: () => void;
  /** Play a `CHHapticPattern` haptic pattern with a given sharpness and intensity between 0-1. */
  playHapticPattern: (sharpness: number, intensity: number) => Promise<void>;
};

function useHapticsEngine() {
  if (!hap) return;
  useEffect(() => {
    hap.createEngine();

    // The engine must be recreated when the app resumes.
    const off = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        hap.createEngine();
      } else if (state === "background") {
        hap.destroyEngine();
      }
    });

    return () => {
      off.remove();
    };
  }, []);
}

function playHaptic(intensity: number) {
  if (!hap) return;
  if (intensity >= 1) {
    hap.playHapticPattern(1, 1);
  } else {
    hap.playHapticPattern(
      // Sharpness. Adding a baseline of 0.2 and then scaling the intensity by 0.2 gives a nice range of haptic feedback.
      0.2 + intensity * 0.2,
      // Intensity. Scaling from no intensity to half intensity by the end. Avoid using 1 as it will conflict with the final haptic event.
      intensity * 0.5
    );
  }
}

// Threshold for triggering a haptic event, the larger this number is, the longer the gesture before the haptic event is triggered.
// Spacing this out gives a bit more texture to the event, helping each tap to feel more distinct.
// Lower numbers like 2-3 feel like a rubber band, while higher numbers (5-10) feel like a gear or a roller coaster.
const TAP_DISTANCE = 2;
// This is just a guess based on my iPhone 14 pro max. This should be the distance the user needs to pull down to trigger the refresh.
const refreshDistanceThreshold = Dimensions.get("window").height * 0.178111588;

export function ArcScrollView(props: ScrollViewProps) {
  useHapticsEngine();

  const isTouching = useRef(false);
  const lastPosition = useRef(0);
  const hasPopped = useRef(false);

  return (
    <ScrollView
      {...props}
      onScrollBeginDrag={(event) => {
        // The haptics map to the user scrolling, disable them when the user is not touching the screen.
        isTouching.current = true;
        props.onScrollBeginDrag?.(event);
      }}
      onScrollEndDrag={(event) => {
        isTouching.current = false;
        lastPosition.current = event.nativeEvent.contentOffset.y;
        props.onScrollEndDrag?.(event);
      }}
      onScroll={(event) => {
        props.onScroll?.(event);
        if (!isTouching.current) {
          return;
        }

        const offset = Math.max(-event.nativeEvent.contentOffset.y, 0);
        const threshold = refreshDistanceThreshold;

        const absProgress = offset / threshold;
        const progress = Math.min(absProgress, 1.0);

        // Apply ease-in effect to the progress
        const easedProgress = Easing.ease(progress);

        if (Math.abs(offset - lastPosition.current) >= TAP_DISTANCE) {
          if (hasPopped.current) {
            if (easedProgress < 1) {
              hasPopped.current = false;
            }
            return;
          } else {
            if (easedProgress >= 1) {
              hasPopped.current = true;
            }
            playHaptic(easedProgress);
          }

          lastPosition.current = offset;
        }
      }}
    />
  );
}

import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";
import { AppState } from "react-native";

// Custom hook to hide the navigation bar and reapply settings when app comes to foreground
export function useHideNavigationBar() {
  useEffect(() => {
    const hideBar = async () => {
      await NavigationBar.setVisibilityAsync("hidden");
    };
    hideBar(); // run once on mount
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        hideBar(); // reapply when app comes back to foreground
      }
    });

    return () => sub.remove();
  }, []);
}

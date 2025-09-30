import { useHideNavigationBar } from "@/constants/global";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  useHideNavigationBar();

  return (
    <SafeAreaProvider>
      {/* Apply safe area only at the top (for status bar) */}
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#673ab7" }}
        edges={["top", "left", "right", "bottom"]}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor={"#673ab7"}
          animated={true}
        />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        /> */}
        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

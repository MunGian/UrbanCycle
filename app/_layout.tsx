import { SooBottomSheetProvider } from "@/components/SooBottomSheetProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  // useHideNavigationBar();

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView className="flex-1">
        <SafeAreaView className="flex-1 bg-body">
          <SooBottomSheetProvider>
            <ToastProvider>
              <StatusBar
                barStyle="dark-content"
                backgroundColor={"#fff"}
                animated={true}
              />
              <Stack
                initialRouteName="(tabs)"
                screenOptions={{ headerShown: false }}
              >
                <Stack.Screen name="auth" />
                <Stack.Screen name="(tabs)" />
                {/* <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          /> */}
              </Stack>
            </ToastProvider>
          </SooBottomSheetProvider>
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

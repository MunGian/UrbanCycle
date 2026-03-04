import { AuthProvider } from "@/components/AuthProvider";
import { SooBottomSheetProvider } from "@/components/SooBottomSheetProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { useBottomSheetBackHandler } from "@/lib/hooks/useSooBottomSheetBackHandler";
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
  // Add this hook to any file using SooBottomSheet
  // Handles bottom sheet back automatically
  useBottomSheetBackHandler();

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView className="flex-1">
        <AuthProvider>
          <SooBottomSheetProvider>
            <SafeAreaView className="flex-1 bg-body">
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
                  <Stack.Screen name="pages/itemDetails" />
                  <Stack.Screen name="pages/message" />
                  <Stack.Screen name="pages/messageRoom" />
                  <Stack.Screen name="pages/cart" />
                </Stack>
              </ToastProvider>
            </SafeAreaView>
          </SooBottomSheetProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

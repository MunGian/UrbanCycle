import { Stack } from "expo-router";
import React from "react";

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
// AppState.addEventListener("change", (state) => {
//   if (state === "active") {
//     console.log("refreshing token......................");
//     supabase.auth.startAutoRefresh();
//   } else {
//     supabase.auth.stopAutoRefresh();
//   }
// });

// console.log("supabase", supabase.auth);

const Auth: React.FC = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="resetPassword" />
      <Stack.Screen name="callback" />
    </Stack>
  );
};

export default Auth;

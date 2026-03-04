import { Route } from "@/lib/utils/routes";
import { supabase } from "@/lib/utils/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const AuthCallback = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
      const { code, error, error_description } = params;

      if (error) {
        console.error("Auth error:", error, error_description);
        // Handle error (e.g., show alert)
        router.replace("/auth/login");
        return;
      }

      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(
          code as string
        );

        if (error) {
          console.error("Exchange code error:", error);
          router.replace("/auth/login");
        } else {
          console.log("Session established:", data.session);
          router.replace(Route.HomePage);
        }
      } else {
        // If no code, maybe it's implicit flow or just a direct open
        // Check if we have a session already
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          router.replace(Route.HomePage);
        } else {
          router.replace("/auth/login");
        }
      }
    };

    handleAuth();
  }, [params]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#000000" />
      <Text className="mt-4 text-gray-600">Verifying...</Text>
    </View>
  );
};

export default AuthCallback;

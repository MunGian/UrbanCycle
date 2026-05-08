import { Route } from "@/lib/utils/routes";
import { supabase } from "@/lib/utils/supabase";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const AuthCallback = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const { code, error, error_description } = params;
        const authCodeFromParams = Array.isArray(code) ? code[0] : code;
        const authErrorFromParams = Array.isArray(error) ? error[0] : error;
        const authErrorDescriptionFromParams = Array.isArray(error_description)
          ? error_description[0]
          : error_description;
        const currentUrl = await Linking.getInitialURL();
        const parsedUrl = currentUrl ? Linking.parse(currentUrl) : null;
        const queryParams = parsedUrl?.queryParams ?? {};
        const urlCode = queryParams.code;
        const urlError = queryParams.error;
        const urlErrorDescription = queryParams.error_description;
        const authCode =
          typeof authCodeFromParams === "string"
            ? authCodeFromParams
            : typeof urlCode === "string"
              ? urlCode
              : undefined;
        const authError =
          typeof authErrorFromParams === "string"
            ? authErrorFromParams
            : typeof urlError === "string"
              ? urlError
              : undefined;
        const authErrorDescription =
          typeof authErrorDescriptionFromParams === "string"
            ? authErrorDescriptionFromParams
            : typeof urlErrorDescription === "string"
              ? urlErrorDescription
              : undefined;

        if (authError) {
          console.error("Auth error:", authError, authErrorDescription);
          router.replace(Route.LoginPage);
          return;
        }

        if (typeof authCode === "string" && authCode.length > 0) {
          const { data, error } =
            await supabase.auth.exchangeCodeForSession(authCode);

          if (error) {
            console.error("Exchange code error:", error);
          } else {
            console.log("Session established:", data.session);
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          router.replace(Route.HomePage);
          return;
        }

        router.replace(Route.LoginPage);
      } catch (error) {
        console.error("Auth callback handling failed:", error);
        router.replace(Route.LoginPage);
      }
    };

    void handleAuth();
  }, [params, router]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#000000" />
      <Text className="mt-4 text-gray-600">Verifying...</Text>
    </View>
  );
};

export default AuthCallback;

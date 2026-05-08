import AlertModal from "@/components/AlertModal";
import { SooBottomSheet } from "@/components/SooBottomSheetController";
import { Route } from "@/lib/utils/routes";
import { supabase } from "@/lib/utils/supabase";
import Feather from "@expo/vector-icons/Feather";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type RecoveryParams = {
  code?: string;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
  errorDescription?: string;
};

const parsePairs = (raw: string): Record<string, string> => {
  return raw
    .split("&")
    .filter((pair) => pair.includes("="))
    .reduce<Record<string, string>>((acc, pair) => {
      const [rawKey, rawValue] = pair.split("=");
      const key = decodeURIComponent(rawKey ?? "");
      const value = decodeURIComponent(rawValue ?? "");
      if (key.length > 0) {
        acc[key] = value;
      }
      return acc;
    }, {});
};

const getSingleParam = (
  value: string | string[] | undefined,
): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

const ResetPassword: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [confirmPasswordVisibility, setConfirmPasswordVisibility] =
    useState(true);
  const [initializing, setInitializing] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  const parsedParams = useMemo<RecoveryParams>(() => {
    return {
      code: getSingleParam(params.code),
      accessToken: getSingleParam(params.access_token),
      refreshToken: getSingleParam(params.refresh_token),
      error: getSingleParam(params.error),
      errorDescription: getSingleParam(params.error_description),
    };
  }, [params]);

  const showErrorModal = (message: string) => {
    SooBottomSheet.push({
      needPadding: false,
      child: (
        <AlertModal
          title="Password Reset Failed"
          description={message}
          status="failed"
          confirmText="Try Again"
          onClose={() => {
            SooBottomSheet.pop();
          }}
        />
      ),
    });
  };

  const showSuccessModal = () => {
    SooBottomSheet.push({
      needPadding: false,
      child: (
        <AlertModal
          title="Password Updated"
          description="Your password has been changed successfully. Please log in with your new password."
          status="success"
          confirmText="Go to Login"
          onClose={() => {
            SooBottomSheet.pop();
            router.replace(Route.LoginPage);
          }}
        />
      ),
    });
  };

  useEffect(() => {
    let isMounted = true;

    const initializeRecoverySession = async () => {
      setInitializing(true);
      setRecoveryReady(false);
      setRecoveryError(null);

      const initialUrl = await Linking.getInitialURL();
      const hashParams = initialUrl?.includes("#")
        ? parsePairs(initialUrl.split("#")[1] ?? "")
        : {};
      const queryParams =
        initialUrl && initialUrl.includes("?")
          ? parsePairs(initialUrl.split("?")[1]?.split("#")[0] ?? "")
          : {};

      const code = parsedParams.code ?? queryParams.code ?? hashParams.code;
      const accessToken =
        parsedParams.accessToken ??
        queryParams.access_token ??
        hashParams.access_token;
      const refreshToken =
        parsedParams.refreshToken ??
        queryParams.refresh_token ??
        hashParams.refresh_token;
      const error = parsedParams.error ?? queryParams.error ?? hashParams.error;
      const errorDescription =
        parsedParams.errorDescription ??
        queryParams.error_description ??
        hashParams.error_description;

      if (error) {
        if (!isMounted) return;
        setRecoveryError(
          errorDescription ?? "This password reset link is invalid or expired.",
        );
        setInitializing(false);
        return;
      }

      if (typeof code === "string" && code.length > 0) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (!isMounted) return;
          setRecoveryError(exchangeError.message);
          setInitializing(false);
          return;
        }
      } else if (
        typeof accessToken === "string" &&
        accessToken.length > 0 &&
        typeof refreshToken === "string" &&
        refreshToken.length > 0
      ) {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (setSessionError) {
          if (!isMounted) return;
          setRecoveryError(setSessionError.message);
          setInitializing(false);
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        if (!isMounted) return;
        setRecoveryError(
          "This password reset link is invalid or expired. Please request a new reset email.",
        );
        setInitializing(false);
        return;
      }

      if (!isMounted) return;
      setRecoveryReady(true);
      setInitializing(false);
    };

    void initializeRecoverySession();

    return () => {
      isMounted = false;
    };
  }, [parsedParams]);

  const onUpdatePassword = async () => {
    Keyboard.dismiss();

    if (!recoveryReady) {
      showErrorModal(
        "Reset session is not ready. Please reopen your reset link.",
      );
      return;
    }

    if (password.length < 6) {
      showErrorModal("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      showErrorModal("Passwords do not match.");
      return;
    }

    setUpdating(true);
    const { error } = await supabase.auth.updateUser({ password });
    setUpdating(false);

    if (error) {
      showErrorModal(error.message);
      return;
    }

    await supabase.auth.signOut();
    showSuccessModal();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 flex-col px-5 pt-5 bg-body">
        <View className="flex flex-row w-full items-center">
          <TouchableOpacity onPress={() => router.replace(Route.LoginPage)}>
            <Feather name="arrow-left" size={26} color="black" />
          </TouchableOpacity>
          <Text className="pl-5 text-xl font-semibold">Reset Password</Text>
        </View>

        <View className="h-8" />

        {initializing ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#000000" />
            <Text className="mt-4 text-gray-600">
              Preparing reset session...
            </Text>
          </View>
        ) : recoveryError ? (
          <View className="rounded-xl bg-red-50 border border-red-200 p-4">
            <Text className="text-red-700 text-base font-medium">
              {recoveryError}
            </Text>
          </View>
        ) : (
          <>
            <Text className="text-gray-700 text-base">
              Enter your new password below.
            </Text>

            <View className="h-6" />

            <View className="flex flex-row w-full items-center justify-between bg-cardBg rounded-xl px-4 py-1 gap-1">
              <Feather name="lock" size={20} color="black" />
              <TextInput
                secureTextEntry={passwordVisibility}
                className="flex-1 text-lg font-normal"
                placeholder="New Password"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisibility((current) => !current)}
              >
                {passwordVisibility ? (
                  <Feather name="eye-off" size={18} color="gray" />
                ) : (
                  <Feather name="eye" size={18} color="gray" />
                )}
              </TouchableOpacity>
            </View>

            <View className="h-4" />

            <View className="flex flex-row w-full items-center justify-between bg-cardBg rounded-xl px-4 py-1 gap-1">
              <Feather name="lock" size={20} color="black" />
              <TextInput
                secureTextEntry={confirmPasswordVisibility}
                className="flex-1 text-lg font-normal"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                onPress={() =>
                  setConfirmPasswordVisibility((current) => !current)
                }
              >
                {confirmPasswordVisibility ? (
                  <Feather name="eye-off" size={18} color="gray" />
                ) : (
                  <Feather name="eye" size={18} color="gray" />
                )}
              </TouchableOpacity>
            </View>

            <View className="h-8" />

            <TouchableOpacity
              onPress={onUpdatePassword}
              disabled={updating}
              className={`flex rounded-full py-4 w-full items-center justify-center ${
                updating ? "bg-black opacity-50" : "bg-black opacity-100"
              }`}
            >
              {updating ? (
                <ActivityIndicator className="h-8 w-8" size={28} color="#fff" />
              ) : (
                <Text className="text-white text-lg font-medium">
                  Update Password
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ResetPassword;

import AlertModal from "@/components/AlertModal";
import { SooBottomSheet } from "@/components/SooBottomSheetController";
import { Route } from "@/lib/utils/routes";
import { supabase } from "@/lib/utils/supabase";
import type { EmailOtpType } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

interface VerifyEmailOtpBottomSheetProps {
  email: string;
  password?: string;
  otpType?: Extract<EmailOtpType, "signup" | "email">;
  initialResendCooldownSeconds?: number;
}

const RESEND_COOLDOWN_SECONDS = 60;

const VerifyEmailOtpBottomSheet: React.FC<VerifyEmailOtpBottomSheetProps> = ({
  email,
  password,
  otpType = "signup",
  initialResendCooldownSeconds = 0,
}) => {
  const router = useRouter();
  const [otp, setOtp] = useState<string>("");
  const [isOtpFocused, setIsOtpFocused] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isResendingOtp, setIsResendingOtp] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(
    Math.max(0, Math.floor(initialResendCooldownSeconds)),
  );

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timerId = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timerId);
  }, [resendCooldown]);

  const inputPaddingY = useMemo(
    () => (Platform.OS === "ios" ? "py-4" : "py-1"),
    [],
  );
  const resendCooldownLabel = useMemo(() => {
    if (resendCooldown <= 0) return "Resend OTP";
    const seconds = resendCooldown % 60;
    return `Resend OTP in 00:${seconds.toString().padStart(2, "0")}`;
  }, [resendCooldown]);

  const verifyOtp = async () => {
    const token = otp.trim();
    if (!token) return;

    setIsVerifying(true);
    setErrorMessage("");
    console.log("verifyOtp:start", { email });

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: otpType,
    });

    if (error) {
      console.log("verifyOtp:error", { email, message: error.message });
      setErrorMessage(error.message);
      setIsVerifying(false);
      return;
    }

    let hasSession = Boolean(data.session);
    if (!hasSession && password) {
      console.log("verifyOtp:no-session-signing-in", { email });
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        console.error("verifyOtp:sign-in-error", {
          email,
          message: signInError.message,
        });
        setErrorMessage(signInError.message);
        setIsVerifying(false);
        return;
      }
      hasSession = true;
    }

    if (!hasSession) {
      setErrorMessage(
        "Verification succeeded, but no active session was created.",
      );
      setIsVerifying(false);
      return;
    }

    console.log("verifyOtp:success", { email });
    setIsVerifying(false);
    SooBottomSheet.popAll();
    router.replace(Route.HomePage);
  };

  const resendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsResendingOtp(true);
    setErrorMessage("");
    console.log("resendOtp:start", { email, otpType });

    let error: { message: string } | null = null;
    if (otpType === "signup") {
      const resendResult = await supabase.auth.resend({
        type: "signup",
        email,
      });
      error = resendResult.error;
    } else {
      const emailRedirectTo = Linking.createURL("/auth/callback");
      const otpResult = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo,
        },
      });
      error = otpResult.error;
    }

    if (error) {
      console.error("resendOtp:error", { email, message: error.message });
      setErrorMessage(error.message);
      setIsResendingOtp(false);
      return;
    }

    setIsResendingOtp(false);
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    SooBottomSheet.push({
      title: "",
      needPadding: false,
      child: (
        <AlertModal
          title="OTP Sent"
          description="A new verification code has been sent to your email."
          status="success"
          onClose={() => {
            SooBottomSheet.pop();
          }}
        />
      ),
    });
  };

  const isVerifyDisabled = otp.trim().length === 0 || isVerifying;

  return (
    <View className="flex flex-col mt-2">
      <Text className="text-gray-700 text-sm leading-relaxed text-justify">
        Enter the OTP sent to <Text className="font-semibold">{email}</Text>.
      </Text>
      <View className="h-4" />
      <View
        className={`flex flex-row w-full items-center justify-between bg-gray-100 rounded-xl px-4 py-1 gap-x-1 ${inputPaddingY}
          ${isOtpFocused ? "border border-black" : ""}`}
      >
        <BottomSheetTextInput
          style={{ fontSize: 16 }}
          className="flex-1"
          placeholder="Verification code"
          placeholderTextColor={"gray"}
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          textAlignVertical="center"
          autoCorrect={false}
          onFocus={() => setIsOtpFocused(true)}
          onBlur={() => setIsOtpFocused(false)}
        />
      </View>
      {errorMessage.length > 0 && (
        <>
          <View className="h-2" />
          <Text className="text-red-500 text-sm">{errorMessage}</Text>
        </>
      )}
      <View className="h-6" />
      <TouchableOpacity
        onPress={verifyOtp}
        disabled={isVerifyDisabled}
        className={`flex rounded-full py-4 w-full items-center justify-center ${
          isVerifyDisabled ? "bg-black opacity-50" : "bg-black opacity-100"
        }`}
      >
        {isVerifying ? (
          <ActivityIndicator className="h-8 w-8" size={24} color="#fff" />
        ) : (
          <Text className="text-white text-lg font-medium">Verify Email</Text>
        )}
      </TouchableOpacity>
      <View className="h-4" />
      <TouchableOpacity
        onPress={resendOtp}
        disabled={isResendingOtp || resendCooldown > 0}
        className="items-center justify-center py-2"
      >
        <Text
          className={`text-sm ${
            isResendingOtp || resendCooldown > 0
              ? "text-gray-400"
              : "text-blue-600"
          }`}
        >
          {isResendingOtp ? "Sending OTP..." : resendCooldownLabel}
        </Text>
      </TouchableOpacity>
      <View className="h-14" />
    </View>
  );
};

export default VerifyEmailOtpBottomSheet;

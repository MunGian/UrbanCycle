import AlertModal from "@/components/AlertModal";
import { SooBottomSheet } from "@/components/SooBottomSheetController";
import { fetchUserProfile } from "@/lib/api/api";
import { Route } from "@/lib/utils/routes";
import { supabase } from "@/lib/utils/supabase";
import { useUserStore } from "@/lib/zustand/useUserStore";
import Feather from "@expo/vector-icons/Feather";
import Fontisto from "@expo/vector-icons/Fontisto";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import VerifyEmailOtpBottomSheet from "./components/VerifyEmailOtpBottomSheet";

const Login: React.FC = () => {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isEmailFocused, setIsEmailFocused] = useState<boolean>(false);
  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);
  const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);
  const [passwordVisibility, setPasswordVisibility] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const onInvalidCredential = () => {
    SooBottomSheet.push({
      needPadding: false,
      child: (
        <AlertModal
          title="Invalid Credentials"
          description="The email or password you entered is incorrect."
          status="failed"
          confirmText="Try Again"
          onClose={() => {
            SooBottomSheet.pop();
          }}
        />
      ),
    });
  };

  const onAccessDenied = () => {
    SooBottomSheet.push({
      needPadding: false,
      isDismissible: false,
      needCloseButton: false,
      child: (
        <AlertModal
          title="Access Denied"
          description="Administrative accounts cannot be used on the mobile application. Please use the web dashboard."
          status="failed"
          confirmText="Understood"
          onClose={() => {
            SooBottomSheet.pop();
          }}
        />
      ),
    });
  };

  const signInWithGoogle = async () => {
    console.log("signInWithGoogle");
  };

  const logInWithEmail = async () => {
    Keyboard.dismiss();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const message = error.message.toLowerCase();
        const isEmailNotVerified =
          message.includes("email not confirmed") ||
          (error as { code?: string }).code === "email_not_confirmed";
        if (isEmailNotVerified && email.length > 0) {
          SooBottomSheet.push({
            title: "Verify your email",
            needPadding: true,
            child: (
              <VerifyEmailOtpBottomSheet email={email} password={password} />
            ),
          });
          return;
        }
        onInvalidCredential();
        return;
      }

      if (data.user) {
        console.log("Login Successful!");
        console.log("User ID:", data.user.id);
        console.log("Session:", data.session);

        const profile = await fetchUserProfile(data.user.id);
        if (profile?.role === "admin") {
          await supabase.auth.signOut();
          onAccessDenied();
          return;
        }

        if (profile) {
          useUserStore.getState().setUser(profile);
        }

        router.replace(Route.HomePage);
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      Alert.alert("Login Failed", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onEmailTextChange = (text: string) => {
    setEmail(text);
    setIsEmailValid(validateEmail(text));
  };

  const onPasswordTextChange = (text: string) => {
    setPassword(text);
  };

  const validateEmail = (email: string) => {
    if (!email || email.length === 0) return true;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const onClearEmailText = () => {
    setEmail("");
  };

  const togglePasswordVisibility = () => {
    setPasswordVisibility(!passwordVisibility);
  };

  const isLoginDisabled =
    email.length === 0 || !isEmailValid || password.length === 0 || loading;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 flex-col px-5 pt-5 bg-body justify-start items-start">
        <View className="flex flex-row w-full justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={26} color="black" />
          </TouchableOpacity>
          <Text className="pl-5 text-xl font-semibold">UrbanCycle Login</Text>
          <TouchableOpacity onPress={() => router.push(Route.SignUpPage)}>
            <Text className="text-zinc-700 text-lg font-medium">Sign Up</Text>
          </TouchableOpacity>
        </View>
        <View className="h-8" />
        <View className="flex flex-row bg-cardBg rounded-full px-4 py-1.5 gap-2">
          <Text className="text-base font-semibold">Sign in with Email</Text>
        </View>
        <View className="h-6" />
        <View className="flex flex-col w-full">
          <View
            className={`flex flex-row w-full mb-2 items-center justify-between bg-cardBg rounded-xl px-4 py-1 gap-1 
              ${isEmailFocused ? "border border-black" : ""} ${!isEmailValid && !isEmailFocused ? "border border-red-500" : ""}`}
          >
            <Fontisto name="email" size={20} color="black" />
            <TextInput
              className="flex-1 text-lg"
              placeholder="Email"
              value={email}
              onChangeText={onEmailTextChange}
              autoCapitalize={"none"}
              keyboardType="email-address"
              textContentType="emailAddress"
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => {
                setIsEmailFocused(false);
                setIsEmailValid(validateEmail(email));
              }}
            />
            {email.length > 0 && isEmailFocused && (
              <TouchableOpacity onPress={onClearEmailText}>
                <MaterialIcons name="cancel" size={18} color="gray" />
              </TouchableOpacity>
            )}
          </View>
          {!isEmailValid && !isEmailFocused && (
            <Text className="text-red-500 mb-1">
              Please enter a valid email address.
            </Text>
          )}
          <View className="h-4" />
          <View
            className={`flex flex-row w-full items-center justify-between bg-cardBg rounded-xl px-4 py-1 gap-1 ${isPasswordFocused ? "border border-black" : ""}`}
          >
            <Feather name="lock" size={20} color="black" />
            <TextInput
              secureTextEntry={passwordVisibility}
              className="flex-1 text-lg font-normal"
              placeholder="Password"
              value={password}
              onChangeText={onPasswordTextChange}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
            />
            <TouchableOpacity onPress={togglePasswordVisibility}>
              {passwordVisibility ? (
                <Feather name="eye-off" size={18} color="gray" />
              ) : (
                <Feather name="eye" size={18} color="gray" />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View className="h-8" />
        <TouchableOpacity
          onPress={logInWithEmail}
          disabled={isLoginDisabled}
          className={`flex rounded-full py-4 w-full items-center justify-center ${
            isLoginDisabled ? "bg-black opacity-50" : "bg-black opacity-100"
          }`}
        >
          {loading ? (
            <ActivityIndicator className="h-8 w-8" size={28} color="#fff" />
          ) : (
            <Text className="text-white text-lg font-medium">Login Now</Text>
          )}
        </TouchableOpacity>
        {/* <View className="h-8" />
        <View className="flex flex-row items-center w-full">
          <View className="flex-1 h-[1px] bg-gray-300" />
          <Text className="mx-4 text-base text-gray-500 text-center">
            Or continue with
          </Text>
          <View className="flex-1 h-[1px] bg-gray-300" />
        </View>
        <View className="h-8" />
        <View className="flex flex-col w-full gap-4">
          <TouchableOpacity
            onPress={signInWithGoogle}
            className="flex flex-row border border-gray-300 rounded-full px-4 py-3 items-center justify-center gap-2"
          >
            <Image
              source={{
                uri: "https://storage.googleapis.com/libraries-lib-production/images/GoogleLogo-canvas-404-300px.original.png",
              }}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
            <Text className="text-lg font-medium">Google</Text>
          </TouchableOpacity>
        </View> */}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Login;

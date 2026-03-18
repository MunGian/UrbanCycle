import EmphasizedText from "@/components/EmphasizedText";
import { SooBottomSheet } from "@/components/SooBottomSheetController";
import { supabase } from "@/lib/utils/supabase";
import { Feather } from "@expo/vector-icons";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import AlertModal from "@/components/AlertModal";
import PrivacyPolicyBottomSheet from "./PrivacyPolicyBottomSheet";
import TermsOfServiceBottomSheet from "./TermsOfServiceBottomSheet";

interface SignUpPasswordBottomSheetProps {
  email?: string;
}

const SignUpPasswordBottomSheet: React.FC<SignUpPasswordBottomSheetProps> = ({
  email,
}) => {
  const [password, setPassword] = useState<string>("");
  const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(true);
  const [passwordRules, setPasswordRules] = useState({
    hasLower: false,
    hasUpper: false,
    hasNumber: false,
    hasSpecial: false,
    hasLength: false,
  });
  const [passwordVisibility, setPasswordVisibility] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const validatePassword = (password: string) => {
    const rules = {
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
      hasLength: password.length >= 6,
    };
    const isValid = Object.values(rules).every(Boolean);
    return { isValid, rules };
  };

  const onPasswordTextChange = (text: string) => {
    setPassword(text);
    const { isValid, rules } = validatePassword(text);
    setIsPasswordValid(isValid);
    setPasswordRules(rules);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisibility(!passwordVisibility);
  };

  const onContinuePress = async () => {
    if (!email || !password) return;

    // // This handles both:
    // // 1. Development (Expo Go): exp://...
    // // 2. Production (Build): urbancycle://...
    // const redirectUrl = Linking.createURL("/auth/callback", {
    //   scheme: "urbancycle",
    // });
    // console.log("Redirect URL:", redirectUrl);

    setLoading(true);
    const {
      data: { user, session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
      // options: {
      //   emailRedirectTo: redirectUrl,
      // },
    });
    if (error) {
      SooBottomSheet.push({
        title: "",
        needPadding: false,
        isDismissible: false,
        needCloseButton: false,
        child: (
          <AlertModal
            title="Sign Up Failed"
            description={error.message}
            status="failed"
            onClose={() => {
              SooBottomSheet.popAll();
            }}
          />
        ),
      });
      return;
    }
    // Insert into User Table in DB
    if (user) {
      const { data: profile } = await supabase
        .from("user")
        .select("id")
        .eq("id", user.id)
        .single();

      console.log("Profile exists:", profile);
    }

    console.log("Sign up response:", { user, session, error });
    SooBottomSheet.popAll();

    // if (session) {
    //   // This block handles cases where email confirmation is OFF.
    //   // If confirmation is ON, session will be null here.
    //   console.log(
    //     "Session created immediately (Email confirmation likely OFF)"
    //   );
    //   router.push(Route.HomePage);
    //   return;
    // }

    // if (error) {
    //   console.error("Sign up error:", error);
    //   Alert.alert("Sign Up Failed", error.message);
    //   setLoading(false);
    //   return;
    // }

    // // Email confirmation is ON, and sign-up was successful.
    // // Show alert and navigate to Login page to wait for verification.
    // Alert.alert(
    //   "Verification Email Sent",
    //   "Please check your inbox to verify your account. Then log in.",
    //   [
    //     {
    //       text: "OK",
    //       onPress: () => {
    //         // Close the bottom sheet and navigate to login
    //         SooBottomSheet.popAll();
    //         router.back();
    //       },
    //     },
    //   ]
    // );
    setLoading(false);
  };

  const passwordRuleItem = (passed: boolean, label: string) => {
    return (
      <View className="flex flex-row items-center mt-1">
        <Feather
          name={passed ? "check-circle" : "x-circle"}
          size={18}
          color={passed ? "green" : "red"}
        />
        <Text
          className={`ml-2 text-sm ${
            passed ? "text-green-500" : "text-red-500"
          }`}
        >
          {label}
        </Text>
      </View>
    );
  };

  const inputPaddingY = React.useMemo(
    () => (Platform.OS === "ios" ? "py-4" : "py-1"),
    [],
  );

  const isLoginDisabled = password.length === 0 || !isPasswordValid || loading;

  return (
    <ScrollView
      className="flex-1"
      keyboardShouldPersistTaps={"handled"}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex flex-col mt-2">
        <View
          className={`flex flex-row w-full items-center justify-between bg-gray-100 rounded-xl px-4 py-1 gap-x-1 ${inputPaddingY}
              ${isPasswordFocused ? "border border-black" : ""} ${!isPasswordValid && !isPasswordFocused ? "border border-red-500" : ""}`}
        >
          <Feather name="lock" size={20} color="black" />
          <BottomSheetTextInput
            secureTextEntry={passwordVisibility}
            style={{ fontSize: 16 }}
            className="flex-1"
            placeholder="Password"
            placeholderTextColor={"gray"}
            value={password}
            onChangeText={onPasswordTextChange}
            keyboardType="default"
            textContentType="password"
            textAlignVertical="center"
            autoCorrect={false}
            autoCapitalize={"none"}
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
        {(!isPasswordValid || isPasswordFocused) && (
          <View className="mt-2">
            {passwordRuleItem(
              passwordRules.hasLower,
              "Must include a lowercase letter",
            )}
            {passwordRuleItem(
              passwordRules.hasUpper,
              "Must include an uppercase letter",
            )}
            {passwordRuleItem(passwordRules.hasNumber, "Must include a number")}
            {passwordRuleItem(
              passwordRules.hasSpecial,
              "Must include a symbol",
            )}
            {passwordRuleItem(
              passwordRules.hasLength,
              "Must be at least 6 characters long",
            )}
          </View>
        )}
        <View className="h-4" />
        <EmphasizedText
          text="By proceeding with this application, you acknowledge that you have read, understood, and agree to be bound by our <em>Terms of Service</em> and <em>Privacy Policy</em>."
          className="text-gray-700 text-sm leading-relaxed text-justify"
          emClassName="text-blue-600 font-semibold"
          onEmphasizedPress={(emText) => {
            if (emText === "Terms of Service") {
              SooBottomSheet.push({
                title: "Terms of Service",
                child: <TermsOfServiceBottomSheet />,
                needPadding: true,
              });
            } else if (emText === "Privacy Policy") {
              SooBottomSheet.push({
                title: "Privacy Policy",
                child: <PrivacyPolicyBottomSheet />,
                needPadding: true,
              });
            }
          }}
        />
        <View className="h-8" />
        <TouchableOpacity
          onPress={onContinuePress}
          disabled={isLoginDisabled}
          className={`flex rounded-full py-4 w-full items-center justify-center ${
            isLoginDisabled ? "bg-black opacity-50" : "bg-black opacity-100"
          }`}
        >
          <Text className="text-white text-lg font-medium">
            {loading ? (
              <ActivityIndicator className="h-8 w-8" size={28} color="#fff" />
            ) : (
              "Next"
            )}
          </Text>
        </TouchableOpacity>
        <View className="h-12" />
      </View>
    </ScrollView>
  );
};

export default SignUpPasswordBottomSheet;

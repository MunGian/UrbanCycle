import EmphasizedText from "@/components/EmphasizedText";
import { SooBottomSheet } from "@/components/SooBottomSheetProvider";
import { Fontisto, MaterialIcons } from "@expo/vector-icons";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SignUpPasswordBottomSheet from "./SignUpPasswordBottomSheet";

const { height: screenHeight } = Dimensions.get("window");

const SignUpEmailBottomSheet: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [isEmailFocused, setIsEmailFocused] = useState<boolean>(false);
  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);

  const onContinuePress = () => {
    SooBottomSheet.push({
      title: "Enter your password",
      child: <SignUpPasswordBottomSheet email={email} />,
      needPadding: true,
    });
  };

  const signUpWithEmail = async () => {
    console.log("signUpWithEmail");
  };

  const onEmailTextChange = (text: string) => {
    setEmail(text);
    setIsEmailValid(validateEmail(text));
  };

  const validateEmail = (email: string) => {
    if (!email || email.length === 0) return true;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const onClearEmailText = () => {
    setEmail("");
  };

  const inputPaddingY = React.useMemo(
    () => (Platform.OS === "ios" ? "py-4" : "py-1"),
    []
  );

  const isLoginDisabled = email.length === 0 || !isEmailValid;
  console.log("isLoginDisabled", isLoginDisabled);

  return (
    <View className="flex flex-col mt-2">
      <View
        className={`flex flex-row w-full items-center justify-between bg-gray-100 rounded-xl px-4 py-1 gap-x-1 ${inputPaddingY}
              ${isEmailFocused ? "border border-black" : ""} ${!isEmailValid && !isEmailFocused ? "border border-red-500" : ""}`}
      >
        <Fontisto name="email" size={20} color="black" />
        <BottomSheetTextInput
          style={{ fontSize: 16 }}
          className="flex-1"
          placeholder="Email"
          placeholderTextColor={"gray"}
          value={email}
          onChangeText={onEmailTextChange}
          keyboardType="email-address"
          textContentType="emailAddress"
          textAlignVertical="center"
          autoCorrect={false}
          autoCapitalize={"none"}
          onFocus={() => {
            setIsEmailFocused(true);
          }}
          onBlur={() => {
            setIsEmailFocused(false);
            setIsEmailValid(validateEmail(email));
          }}
        />
        {email.length > 0 && isEmailFocused && (
          <TouchableOpacity onPressIn={onClearEmailText}>
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
      <EmphasizedText
        text="By proceeding with this application, you acknowledge that you have read, understood, and agree to be bound by our <em>Terms of Service</em> and <em>Privacy Policy</em>."
        className="text-gray-700 text-sm leading-relaxed text-justify"
        emClassName="text-blue-600 font-semibold"
        onEmphasizedPress={(emText) => {
          if (emText === "Terms of Service") {
            console.log("Open Terms of Service");
          } else if (emText === "Privacy Policy") {
            console.log("Open Privacy Policy");
          }
        }}
      />
      <View className="h-8" />
      <TouchableOpacity
        onPress={onContinuePress}
        disabled={isLoginDisabled}
        className={`flex rounded-full py-4 w-full items-center justify-center ${
          isLoginDisabled
            ? // ? "bg-orange-400 opacity-50"
              // : "bg-orange-400 opacity-100"
              "bg-brandPrimary opacity-50"
            : "bg-brandPrimary opacity-100"
        }`}
      >
        <Text className="text-black text-lg font-medium">Next</Text>
      </TouchableOpacity>
      <View
        className="h-12"
        // style={{
        //   height: isEmailFocused ? screenHeight * 0.4 : screenHeight * 0.4,
        // }}
        // className={`transition-all duration-500`}
      />
    </View>
  );
};

export default SignUpEmailBottomSheet;

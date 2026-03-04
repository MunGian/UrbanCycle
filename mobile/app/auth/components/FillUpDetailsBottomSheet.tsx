import EmphasizedText from "@/components/EmphasizedText";
import { SooBottomSheet } from "@/components/SooBottomSheetController";
import { insertUserName } from "@/lib/api/api";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { MaterialIcons } from "@expo/vector-icons";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import React, { useState } from "react";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";
import FillUpAvatarBottomSheet from "./FillUpAvatarBottomSheet";

const FillUpDetailsBottomSheet: React.FC = () => {
  const setUser = useUserStore((s) => s.setUser);

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [isFirstNameFocused, setIsFirstNameFocused] = useState<boolean>(false);
  const [isLastNameFocused, setIsLastNameFocused] = useState<boolean>(false);

  const onContinuePress = async () => {
    if (!firstName || !lastName) {
      Alert.alert("Missing info", "Please enter your first and last name.");
      return;
    }
    const profile = await insertUserName(firstName, lastName);
    await setUser(profile!);
    SooBottomSheet.pop();
    onOpenAvatarBottomSheet();
  };

  const onOpenAvatarBottomSheet = () => {
    SooBottomSheet.push({
      title: "Upload your avatar",
      needPadding: true,
      child: <FillUpAvatarBottomSheet />,
    });
  };

  const inputPaddingY = React.useMemo(
    () => (Platform.OS === "ios" ? "py-4" : "py-1"),
    []
  );

  const isContinueDisabled = firstName.length === 0 || lastName.length === 0;

  return (
    <View className="flex flex-col mt-2">
      <EmphasizedText
        text="Let’s get to know you! Please enter your first and last name."
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
      <View className="h-4" />
      {/* First Name */}
      <View
        className={`flex flex-row w-full items-center justify-between bg-gray-100 rounded-xl px-4 py-1 gap-x-1 ${inputPaddingY}
              ${isFirstNameFocused ? "border border-black" : ""}`}
      >
        <MaterialIcons name="person" size={20} color="black" />
        <BottomSheetTextInput
          style={{ fontSize: 16 }}
          className="flex-1"
          placeholder="First Name"
          placeholderTextColor={"gray"}
          value={firstName}
          onChangeText={setFirstName}
          autoCorrect={false}
          onFocus={() => setIsFirstNameFocused(true)}
          onBlur={() => setIsFirstNameFocused(false)}
        />
        {firstName.length > 0 && isFirstNameFocused && (
          <TouchableOpacity onPressIn={() => setFirstName("")}>
            <MaterialIcons name="cancel" size={18} color="gray" />
          </TouchableOpacity>
        )}
      </View>
      <View className="h-4" />

      {/* Last Name */}
      <View
        className={`flex flex-row w-full items-center justify-between bg-gray-100 rounded-xl px-4 py-1 gap-x-1 ${inputPaddingY}
              ${isLastNameFocused ? "border border-black" : ""}`}
      >
        <MaterialIcons name="person-outline" size={20} color="black" />
        <BottomSheetTextInput
          style={{ fontSize: 16 }}
          className="flex-1"
          placeholder="Last Name"
          placeholderTextColor={"gray"}
          value={lastName}
          onChangeText={setLastName}
          autoCorrect={false}
          onFocus={() => setIsLastNameFocused(true)}
          onBlur={() => setIsLastNameFocused(false)}
        />
        {lastName.length > 0 && isLastNameFocused && (
          <TouchableOpacity onPressIn={() => setLastName("")}>
            <MaterialIcons name="cancel" size={18} color="gray" />
          </TouchableOpacity>
        )}
      </View>
      <View className="h-8" />
      <TouchableOpacity
        onPress={onContinuePress}
        disabled={isContinueDisabled}
        className={`flex rounded-full py-4 w-full items-center justify-center ${
          isContinueDisabled
            ? "bg-brandPrimary opacity-50"
            : "bg-brandPrimary opacity-100"
        }`}
      >
        <Text className="text-black text-lg font-medium">Next</Text>
      </TouchableOpacity>
      <View className="h-12" />
    </View>
  );
};

export default FillUpDetailsBottomSheet;

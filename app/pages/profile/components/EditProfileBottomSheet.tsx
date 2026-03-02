import { SooBottomSheet } from "@/components/SooBottomSheetController";
import { supabase } from "@/lib/utils/supabase";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface EditProfileContentProps {
  onClose?: () => void;
}

const EditProfileContent: React.FC<EditProfileContentProps> = ({ onClose }) => {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  const [firstName, setFirstName] = useState<string>(user?.first_name || "");
  const [lastName, setLastName] = useState<string>(user?.last_name || "");
  const [bio, setBio] = useState<string>(user?.bio || "");
  const [loading, setLoading] = useState<boolean>(false);

  const [isFirstNameFocused, setIsFirstNameFocused] = useState<boolean>(false);
  const [isLastNameFocused, setIsLastNameFocused] = useState<boolean>(false);
  const [isBioFocused, setIsBioFocused] = useState<boolean>(false);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    const { error } = await supabase
      .from("user")
      .update({
        first_name: firstName,
        last_name: lastName,
        bio: bio,
      })
      .eq("id", user.id);

    if (error) {
      Alert.alert("Error", "Failed to update profile");
      console.error(error);
    } else {
      // Update local store
      setUser({
        ...user,
        first_name: firstName,
        last_name: lastName,
        bio: bio,
      });
      // Close the sheet
      SooBottomSheet.pop();
    }
    setLoading(false);
  };

  return (
    <View className="px-2 pb-8">
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-1">
          First Name
        </Text>
        <BottomSheetTextInput
          value={firstName}
          onChangeText={setFirstName}
          className={`bg-gray-50 border rounded-xl px-4 py-3.5 text-black ${
            isFirstNameFocused ? "border-black" : "border-transparent"
          }`}
          placeholder="Enter first name"
          onFocus={() => setIsFirstNameFocused(true)}
          onBlur={() => setIsFirstNameFocused(false)}
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-1">
          Last Name
        </Text>
        <BottomSheetTextInput
          value={lastName}
          onChangeText={setLastName}
          className={`bg-gray-50 border rounded-xl px-4 py-3.5 text-black ${
            isLastNameFocused ? "border-black" : "border-transparent"
          }`}
          placeholder="Enter last name"
          onFocus={() => setIsLastNameFocused(true)}
          onBlur={() => setIsLastNameFocused(false)}
        />
      </View>

      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-700 mb-1">Bio</Text>
        <BottomSheetTextInput
          value={bio}
          onChangeText={setBio}
          className={`bg-gray-50 border rounded-xl px-4 py-3 text-black h-24 ${
            isBioFocused ? "border-black" : "border-transparent"
          }`}
          placeholder="Tell us about yourself"
          multiline
          textAlignVertical="top"
          onFocus={() => setIsBioFocused(true)}
          onBlur={() => setIsBioFocused(false)}
        />
      </View>

      <TouchableOpacity
        onPress={handleSave}
        disabled={loading}
        className={`${loading ? "bg-gray-400" : "bg-black"} rounded-full py-4 items-center`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-lg">Save Changes</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default EditProfileContent;

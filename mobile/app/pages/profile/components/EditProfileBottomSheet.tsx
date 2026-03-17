import { SooBottomSheet } from "@/components/SooBottomSheetController";
import { upsertAvatar } from "@/lib/api/api";
import { supabase } from "@/lib/utils/supabase";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { MaterialIcons } from "@expo/vector-icons";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
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

  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [avatarUri, setAvatarUri] = useState<string | null>(
    user?.avatar_url || null,
  );
  const [loading, setLoading] = useState(false);

  const [isFirstNameFocused, setIsFirstNameFocused] = useState(false);
  const [isLastNameFocused, setIsLastNameFocused] = useState(false);

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your photo library.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let finalAvatarUrl = user.avatar_url;
      if (avatarUri && avatarUri !== user.avatar_url) {
        const publicUrl = await upsertAvatar(user.id, avatarUri);
        if (publicUrl) {
          finalAvatarUrl = `${publicUrl}?t=${new Date().getTime()}`;
        }
      }

      const { error } = await supabase
        .from("user")
        .update({
          first_name: firstName,
          last_name: lastName,
          avatar_url: finalAvatarUrl,
        })
        .eq("id", user.id);

      if (error) {
        Alert.alert("Error", "Failed to update profile");
        console.error(error);
      } else {
        setUser({
          ...user,
          first_name: firstName,
          last_name: lastName,
          avatar_url: finalAvatarUrl,
        });
        Keyboard.dismiss();
        SooBottomSheet.pop();
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="px-4 pb-8 w-full">
      <View className="items-center mb-6">
        <TouchableOpacity onPress={pickAvatar} className="relative">
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              className="w-24 h-24 rounded-full bg-gray-200"
              resizeMode="cover"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center">
              <MaterialIcons name="person" size={48} color="gray" />
            </View>
          )}
          <View className="absolute -bottom-1 -right-2 bg-black p-2 rounded-full border-2 border-white">
            <MaterialIcons name="camera-alt" size={16} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-1">
          First Name
        </Text>
        <BottomSheetTextInput
          value={firstName}
          onChangeText={setFirstName}
          className={`bg-gray-50 border rounded-xl px-4 py-3.5 text-base text-black ${
            isFirstNameFocused ? "border-black" : "border-gray-200"
          }`}
          placeholder="Enter first name"
          placeholderTextColor="#9CA3AF"
          onFocus={() => setIsFirstNameFocused(true)}
          onBlur={() => setIsFirstNameFocused(false)}
        />
      </View>

      <View className="mb-8">
        <Text className="text-sm font-medium text-gray-700 mb-1">
          Last Name
        </Text>
        <BottomSheetTextInput
          value={lastName}
          onChangeText={setLastName}
          className={`bg-gray-50 border rounded-xl px-4 py-3.5 text-base text-black ${
            isLastNameFocused ? "border-black" : "border-gray-200"
          }`}
          placeholder="Enter last name"
          placeholderTextColor="#9CA3AF"
          onFocus={() => setIsLastNameFocused(true)}
          onBlur={() => setIsLastNameFocused(false)}
        />
      </View>

      <TouchableOpacity
        onPress={handleSave}
        disabled={loading}
        className={`${
          loading ? "bg-gray-400" : "bg-black"
        } rounded-full py-4 items-center shadow-sm`}
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

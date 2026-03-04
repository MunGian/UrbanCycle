import { SooBottomSheet } from "@/components/SooBottomSheetController";
import { fetchUserProfile, upsertAvatar } from "@/lib/api/api";
import { supabase } from "@/lib/utils/supabase";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

const FillUpAvatarBottomSheet: React.FC = () => {
  const setUser = useUserStore((s) => s.setUser);

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickAvatarFromDevice = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your photo library."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  /* -------------------- Upload avatar to Supabase -------------------- */
  const uploadAvatar = async (userId: string) => {
    try {
      if (!avatarUri) return null;

      setUploading(true);

      return await upsertAvatar(userId, avatarUri);
    } catch (err) {
      console.error("Avatar upload error:", err);
      Alert.alert("Error", "Failed to upload avatar");
      return null;
    } finally {
      setUploading(false);
    }
  };

  /* -------------------- Save avatar & close -------------------- */
  const onSaveAvatar = async () => {
    if (!avatarUri) {
      Alert.alert("No image selected", "Please choose an avatar.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    const avatarUrl = await uploadAvatar(user.id);
    if (!avatarUrl) return;

    const { error } = await supabase
      .from("user")
      .update({
        avatar_url: avatarUrl,
      })
      .eq("id", user.id);

    if (error) {
      Alert.alert("Error", "Failed to save avatar");
      return;
    }

    const profile = await fetchUserProfile(user.id);
    setUser(profile);
    SooBottomSheet.popAll();
  };

  return (
    <View className="flex items-center mt-2">
      {/* Heading */}
      <Text className="text-sm text-gray-500 text-start leading-relaxed">
        Tap the avatar below to choose a photo from your device. This is
        optional, but recommended to help friends and community members
        recognize you easily.
      </Text>

      {/* Avatar picker */}
      <TouchableOpacity
        onPress={pickAvatarFromDevice}
        className="mt-6 rounded-full shadow-lg overflow-hidden"
      >
        {avatarUri ? (
          <Image
            source={{ uri: avatarUri }}
            className="w-32 h-32 rounded-full"
          />
        ) : (
          <View className="w-32 h-32 rounded-full bg-gray-200 items-center justify-center">
            <MaterialIcons name="camera-alt" size={36} color="gray" />
            <Text className="text-xs text-gray-500 mt-1 text-center">
              Tap to choose a photo
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Save button */}
      <TouchableOpacity
        onPress={onSaveAvatar}
        disabled={uploading || !avatarUri}
        className={`mt-8 w-full py-4 rounded-full items-center ${
          uploading || !avatarUri ? "bg-gray-300" : "bg-brandPrimary"
        }`}
      >
        <Text
          className={`text-lg font-medium ${uploading ? "text-gray-700" : "text-black"}`}
        >
          {uploading ? "Uploading..." : "Save"}
        </Text>
      </TouchableOpacity>

      <View className="h-12" />
    </View>
  );
};

export default FillUpAvatarBottomSheet;

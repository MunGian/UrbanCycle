import { SooBottomSheet } from "@/components/SooBottomSheetController";
import { fetchUserProfile, upsertAvatar } from "@/lib/api/api";
import { supabase } from "@/lib/utils/supabase";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Route } from "@/lib/utils/routes";

const FillUpAvatarBottomSheet: React.FC = () => {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const pickAvatarFromDevice = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your photo library.",
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

      return await upsertAvatar(userId, avatarUri);
    } catch (err) {
      console.error("Avatar upload error:", err);
      Alert.alert("Error", "Failed to upload avatar");
      return null;
    }
  };

  /* -------------------- Save avatar & close -------------------- */
  const onSaveAvatar = async () => {
    if (!avatarUri) {
      Alert.alert("No image selected", "Please choose an avatar.");
      return;
    }

    setUploading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const avatarUrl = await uploadAvatar(user.id);
      if (!avatarUrl) {
        throw new Error("Avatar upload failed");
      }

      const { error } = await supabase
        .from("user")
        .update({
          avatar_url: avatarUrl,
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      const profile = await fetchUserProfile(user.id);
      setUser(profile);

      SooBottomSheet.popAll();
      router.push(Route.HomePage);
    } catch (error: any) {
      console.error("Save avatar error:", error);
      Alert.alert("Error", error.message || "Failed to save avatar");
    } finally {
      setUploading(false);
    }
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

      <TouchableOpacity
        onPress={onSaveAvatar}
        disabled={uploading || !avatarUri}
        className={`mt-8 w-full py-4 rounded-full items-center ${
          uploading || !avatarUri
            ? "bg-black opacity-50"
            : "bg-black opacity-100"
        }`}
      >
        <Text
          className={`text-lg font-medium ${uploading ? "text-white" : "text-white"}`}
        >
          {uploading ? (
            <ActivityIndicator className="h-8 w-8" size={28} color="#fff" />
          ) : (
            "Save"
          )}
        </Text>
      </TouchableOpacity>

      <View className="h-12" />
    </View>
  );
};

export default FillUpAvatarBottomSheet;

import { useToast } from "@/components/ToastProvider";
import { Route } from "@/lib/utils/routes";
import { useRouter } from "expo-router";
import React from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";

const Profile: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <View className="flex-1 bg-blue-300 justify-center items-center">
      <Text>Profile Page</Text>
      <TouchableOpacity
        className="flex px-8 py-4 rounded-full bg-gray-300"
        onPress={() => router.push(Route.LoginPage)}
      >
        <Text>Pressssssssssssssss</Text>
      </TouchableOpacity>
      <View className="h-24" />
      <Button
        title="Show Success Toast"
        onPress={() => showToast("Data saved successfully!", "success")}
      />
    </View>
  );
};

export default Profile;

import { AuthPlaceholder } from "@/components/AuthPlaceholder";
import { SooBottomSheet } from "@/components/SooBottomSheetController";
import { Route } from "@/lib/utils/routes";
import { supabase } from "@/lib/utils/supabase";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { MaterialIcons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import EditProfileContent from "./components/EditProfileBottomSheet";

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const user = useUserStore((s) => s.user);

  if (!user) {
    return <AuthPlaceholder />;
  }

  const handleEditProfile = () => {
    SooBottomSheet.push({
      title: "Edit Profile",
      needPadding: true,
      child: <EditProfileContent />,
    });
  };

  const menuItems = [
    {
      icon: "person-outline",
      label: "Edit Profile",
      onPress: handleEditProfile,
    },
    {
      icon: "inbox",
      label: "Incoming Requests",
      onPress: () => router.push("/pages/transactions/sales"),
    },
    {
      icon: "send",
      label: "My Requests",
      onPress: () => router.push("/pages/transactions/purchases"),
    },
    {
      icon: "list-alt",
      label: "My Listings",
      onPress: () => console.log("My Listings"),
    },
    {
      icon: "favorite-border",
      label: "Saved Items",
      onPress: () => console.log("Saved Items"),
    },
    {
      icon: "settings",
      label: "Settings",
      onPress: () => console.log("Settings"),
    },
    {
      icon: "help-outline",
      label: "Help & Support",
      onPress: () => console.log("Help & Support"),
    },
  ];

  return (
    <View className="flex h-full w-full bg-white">
      <ScrollView className="mb-24" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-black">Profile</Text>
        </View>

        {/* User Profile Card */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center">
            {user.avatar_url ? (
              <Image
                source={{ uri: user.avatar_url }}
                className="w-20 h-20 rounded-full bg-gray-200"
              />
            ) : (
              <MaterialCommunityIcons
                name="face-man-profile"
                size={80}
                color="black"
              />
            )}
            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold text-black">
                {user
                  ? user.first_name + " " + user.last_name || "Friend"
                  : "Guest"}
              </Text>
              <Text className="text-gray-500 text-sm">{user.email}</Text>
              <View className="flex-row items-center mt-1">
                <MaterialIcons name="star" size={16} color="#FBBF24" />
                {user.rating ? (
                  <>
                    <Text className="text-black font-semibold ml-1">
                      {user.rating}
                    </Text>
                    <Text className="text-gray-400 text-xs ml-1">
                      ({user.reviews} reviews)
                    </Text>
                  </>
                ) : (
                  <Text className="text-gray-400 text-xs ml-1">
                    No reviews yet
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity className="p-2" onPress={handleEditProfile}>
              <MaterialIcons name="edit" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row px-6 mb-8">
          <View className="flex-1 bg-gray-50 p-4 rounded-2xl mr-2 items-center">
            <Text className="text-2xl font-bold text-black">
              {user.itemsListed ?? 12}
            </Text>
            <Text className="text-gray-500 text-xs uppercase tracking-wider mt-1">
              Active Listings
            </Text>
          </View>
          <View className="flex-1 bg-gray-50 p-4 rounded-2xl ml-2 items-center">
            <Text className="text-2xl font-bold text-black">
              {user.itemsSold ?? 26}
            </Text>
            <Text className="text-gray-500 text-xs uppercase tracking-wider mt-1">
              Items Donated
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-6">
          <Text className="text-lg font-bold text-black mb-4">Account</Text>
          <View className="bg-gray-50 rounded-2xl overflow-hidden">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
                className={`flex-row items-center p-4 ${
                  index !== menuItems.length - 1
                    ? "border-b border-gray-200"
                    : ""
                }`}
              >
                <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-4">
                  <MaterialIcons
                    name={item.icon as any}
                    size={20}
                    color="black"
                  />
                </View>
                <Text className="flex-1 text-base font-medium text-black">
                  {item.label}
                </Text>
                <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <View className="px-6 mt-8 mb-10">
          <TouchableOpacity
            className="flex-row items-center justify-center bg-red-50 py-4 rounded-full"
            onPress={async () => {
              await supabase.auth.signOut();
              router.replace(Route.HomePage);
            }}
          >
            <MaterialIcons name="logout" size={20} color="#EF4444" />
            <Text className="text-red-500 font-bold ml-2">Log Out</Text>
          </TouchableOpacity>
          <Text className="text-center text-gray-400 text-xs mt-4">
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfilePage;

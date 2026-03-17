import { AuthPlaceholder } from "@/components/AuthPlaceholder";
import { SooBottomSheet } from "@/components/SooBottomSheetProvider";
import { fetchUserItems } from "@/lib/api/api";
import { ListedItem, Review } from "@/lib/api/apiModel";
import { fetchUserReviews } from "@/lib/api/reviews";
import { Route } from "@/lib/utils/routes";
import { supabase } from "@/lib/utils/supabase";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { MaterialIcons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import EditProfileContent from "./components/EditProfileBottomSheet";

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const [showAvatar, setShowAvatar] = useState<boolean>(false);
  const [stats, setStats] = useState({
    rating: 0,
    reviewCount: 0,
    activeListings: 0,
    itemsDonated: 0,
  });

  useEffect(() => {
    if (!user) return;

    const loadStats = async () => {
      try {
        const [items, reviews] = await Promise.all([
          fetchUserItems(user.id),
          fetchUserReviews(user.id),
        ]);

        const userItems = (items || []) as ListedItem[];
        const userReviews = (reviews || []) as Review[];

        const active = userItems.filter((i) => i.status === "Active").length;
        // Assuming 'Sold' status and is_free flag for donations, or just count 'Sold' items as success
        const donated = userItems.filter(
          (i) => i.status === "Sold" || (i.status === "Completed" && i.is_free),
        ).length;

        const ratingSum = userReviews.reduce(
          (acc, r) => acc + (r.rating || 0),
          0,
        );
        const avgRating =
          userReviews.length > 0
            ? (ratingSum / userReviews.length).toFixed(1)
            : 0;

        setStats({
          rating: Number(avgRating),
          reviewCount: userReviews.length,
          activeListings: active,
          itemsDonated: donated,
        });
      } catch (e) {
        console.error("Error loading profile stats:", e);
      }
    };

    loadStats();
  }, [user]);

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
      icon: "inbox",
      label: "Incoming Requests",
      onPress: () => router.push("/pages/transactions/sales"),
    },
    {
      icon: "send",
      label: "My Requests",
      onPress: () => router.push("/pages/transactions/purchases"),
    },
  ];

  return (
    <View className="flex h-full w-full bg-white">
      <ScrollView className="mb-24" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4 pb-4">
          <Text className="text-2xl font-bold text-black">Profile</Text>
        </View>

        <View className="px-6 mb-6">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => setShowAvatar(true)}>
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
            </TouchableOpacity>
            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold text-black">
                {user
                  ? user.first_name + " " + user.last_name || "Friend"
                  : "Guest"}
              </Text>
              <Text className="text-gray-500 text-sm">{user.email}</Text>
              <View className="flex-row items-center mt-1">
                <MaterialIcons name="star" size={16} color="#FBBF24" />
                {stats.reviewCount > 0 ? (
                  <>
                    <Text className="text-black font-bold ml-1 text-base">
                      {stats.rating}
                    </Text>
                    <Text className="text-gray-400 text-base ml-1">
                      ({stats.reviewCount} reviews)
                    </Text>
                  </>
                ) : (
                  <Text className="text-gray-400 text-base ml-1">
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

        <View className="px-6 mt-8 mb-10">
          <TouchableOpacity
            className="flex-row items-center justify-center bg-black py-5 rounded-full"
            onPress={async () => {
              await supabase.auth.signOut();
              router.replace(Route.HomePage);
            }}
          >
            <MaterialIcons name="logout" size={20} color="#FFFFFF" />
            <Text className="text-white font-bold ml-2">Log Out</Text>
          </TouchableOpacity>
          <Text className="text-center text-gray-400 text-xs mt-4">
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={showAvatar}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAvatar(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowAvatar(false)}>
          <View className="flex-1 bg-black/90 justify-center items-center">
            <TouchableOpacity
              className="absolute top-16 right-6 z-10 p-2 bg-black/50 rounded-full"
              onPress={() => setShowAvatar(false)}
            >
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>

            <TouchableWithoutFeedback onPress={() => {}}>
              <View className="w-full aspect-square justify-center items-center p-4">
                {user.avatar_url ? (
                  <Image
                    source={{ uri: user.avatar_url }}
                    className="w-full h-full bg-black"
                    resizeMode="contain"
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="face-man-profile"
                    size={200}
                    color="white"
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default ProfilePage;

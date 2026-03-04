import EmphasizedText from "@/components/EmphasizedText";
import { MarketplaceItem } from "@/lib/api/apiModel";
import { formatLocalDateTime } from "@/lib/constants/commonConst";
import { supabase } from "@/lib/utils/supabase";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ItemDetailsPage: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const user = useUserStore((s) => s.user);
  const [message, setMessage] = useState<string>("");
  const [isLoved, setIsLoved] = useState<boolean>(false); // toggle heart

  const item: MarketplaceItem = route.params?.item;
  console.log("Item details route params:", route.params?.item);

  const handleContactDonor = async () => {
    if (!user) {
      Alert.alert(
        "Please login",
        "You need to be logged in to send a message."
      );
      return;
    }

    if (item.user?.id === user.id) {
      Alert.alert("This is your item", "You cannot message yourself.");
      return;
    }

    if (!item.user?.id) {
      Alert.alert("Error", "Seller information is missing.");
      return;
    }

    try {
      // Check if room exists
      const { data: rooms, error: fetchError } = await supabase
        .from("message_room")
        .select("*")
        .or(
          `and(user1_id.eq.${user.id},user2_id.eq.${item.user.id}),and(user1_id.eq.${item.user.id},user2_id.eq.${user.id})`
        );

      if (fetchError) {
        console.error("Error fetching room:", fetchError);
        throw fetchError;
      }

      let roomId;

      if (rooms && rooms.length > 0) {
        roomId = rooms[0].id;
      } else {
        // Create new room
        const { data: newRoom, error: createError } = await supabase
          .from("message_room")
          .insert({
            user1_id: user.id,
            user2_id: item.user.id,
          })
          .select()
          .single();

        if (createError) throw createError;
        roomId = newRoom.id;
      }

      // If there is a message typed, send it
      if (message.trim()) {
        const { error: msgError } = await supabase.from("message").insert({
          room_id: roomId,
          sender_id: user.id,
          content: message.trim(),
          type: "text",
        });
        if (msgError) console.error("Error sending initial message:", msgError);
        setMessage("");
      }

      // Navigate to chat room
      (navigation as any).navigate("pages/messageRoom", {
        chatId: roomId,
        name: `${item.user.first_name} ${item.user.last_name}`,
        avatar: item.user.avatar_url,
        itemName: item.listed_item.title,
        isOnline: "false",
      });
    } catch (error) {
      console.error("Error initiating chat:", error);
      Alert.alert("Error", "Could not start chat. Please try again.");
    }
  };

  return (
    <View className="flex h-full w-full bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={26} color="black" />
        </TouchableOpacity>

        <Text className="text-center text-xl font-bold text-black flex-1">
          Item Details
        </Text>

        {/* Heart Button */}
        <TouchableOpacity
          onPress={() => setIsLoved(!isLoved)}
          className="p-2 rounded-full bg-gray-100"
        >
          <MaterialIcons
            name={isLoved ? "favorite" : "favorite-border"}
            size={24}
            color={isLoved ? "red" : "black"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View className="w-full bg-gray-100 aspect-square overflow-hidden">
          <Image
            source={{
              uri: Array.isArray(item.listed_item.images)
                ? item.listed_item.images[0]
                : item.listed_item.images,
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Details Section */}
        <View className="px-5 py-5 bg-white -mt-8 rounded-t-3xl shadow-sm">
          {/* Title */}
          <Text className="text-2xl font-bold text-black mb-0 leading-7">
            {item.listed_item.title}
          </Text>

          {/* Price */}
          <EmphasizedText
            text={
              item.listed_item.is_free
                ? "Free"
                : `<em>RM</em> ${(item.listed_item.price || 0).toLocaleString(
                    "en-MY"
                  )}`
            }
            className={`text-2xl font-bold mt-1 mb-2 ${
              item.listed_item.is_free ? "text-emerald-600" : "text-gray-800"
            }`}
            emClassName="text-xl font-bold"
          />

          {/* Item Info */}
          <View className="flex flex-row gap-6">
            <View>
              <Text className="text-xs text-gray-500 mb-1">Category</Text>
              <Text className="text-sm font-semibold text-black">
                {item.listed_item.category}
              </Text>
            </View>

            <View>
              <Text className="text-xs text-gray-500 mb-1">Location</Text>
              <Text className="text-sm font-semibold text-black">
                {item.listed_item.location || "N/A"}
              </Text>
            </View>

            <View>
              <Text className="text-xs text-gray-500 mb-1">Posted On</Text>
              <Text className="text-sm font-semibold text-black">
                {formatLocalDateTime(item.listed_item.created_at!) || "N/A"}
              </Text>
            </View>
          </View>

          <View className="border-t border-gray-200 my-4" />

          {/* Description */}
          <View>
            <Text className="text-lg font-bold text-black mb-2">
              Description
            </Text>
            <Text className="text-sm text-gray-600 leading-5">
              {item.listed_item.description}
            </Text>
            {/* <Text className="text-sm text-gray-600 leading-5 mt-2">
              This is a {item.listed_item.category.toLowerCase()} item available
              for reuse. Part of our circular economy initiative to reduce waste
              in Penang and promote sustainable sharing culture.
            </Text> */}
          </View>

          <View className="border-t border-gray-200 my-6" />

          {/* Donor Section */}
          <Text className="text-lg font-bold text-black mb-3">
            About The Donor
          </Text>

          <View className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm">
            <View className="flex-row items-center mb-4">
              <Image
                source={{
                  uri:
                    item.user?.avatar_url ||
                    "https://randomuser.me/api/portraits/lego/1.jpg",
                }}
                className="w-12 h-12 rounded-full bg-gray-200"
              />

              <View className="ml-3 flex-1">
                <Text className="text-sm font-bold text-black">
                  {item.user
                    ? `${item.user.first_name} ${item.user.last_name}`
                    : "Unknown"}
                </Text>
                <Text className="text-xs text-gray-500">
                  {item.listed_item.location}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-around py-3 border-t border-gray-200">
              <View className="items-center">
                <Text className="text-lg font-bold text-black">12</Text>
                <Text className="text-xs text-gray-500">Items Donated</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold text-black">4.8</Text>
                <Text className="text-xs text-gray-500">Rating</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold text-black">98%</Text>
                <Text className="text-xs text-gray-500">Positive</Text>
              </View>
            </View>
          </View>

          <View className="border-t border-gray-200 my-6" />

          {/* Message Donor */}
          <Text className="text-lg font-bold text-black mb-2">
            Contact Donor
          </Text>

          <TextInput
            placeholder="Ask about pickup time or condition..."
            value={message}
            onChangeText={setMessage}
            multiline
            className="bg-gray-100 border border-gray-300 rounded-2xl px-4 py-3 text-sm text-black mb-4"
            placeholderTextColor="#9CA3AF"
          />

          <TouchableOpacity
            onPress={handleContactDonor}
            className={`bg-black py-4 mb-4 rounded-full items-center shadow-lg flex-row justify-center`}
          >
            <Text className="text-white font-bold text-lg mr-2">
              Send Message to {item.user?.first_name || "Donor"}
            </Text>
            <MaterialIcons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleContactDonor}
            className={`bg-blue-800 py-4 rounded-full items-center shadow-lg flex-row justify-center`}
          >
            <Text className="text-white font-bold text-lg mr-2">
              Add to Cart
            </Text>
            <MaterialIcons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ItemDetailsPage;

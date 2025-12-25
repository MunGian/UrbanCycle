import EmphasizedText from "@/components/EmphasizedText";
import { MarketplaceItem } from "@/lib/api/apiModel";
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
  const [message, setMessage] = useState<string>("");
  const [isLoved, setIsLoved] = useState<boolean>(false); // toggle heart

  const item: MarketplaceItem = route.params?.item || {
    id: "1",
    name: "Batik Shirt (L)",
    seller: "Chistina Wong",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=400&h=400&fit=crop",
    condition: "Like New",
    category: "Clothing",
    location: "Gelugor",
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "Like New":
        return "bg-green-100 text-green-700";
      case "Excellent":
        return "bg-blue-100 text-blue-700";
      case "Good":
        return "bg-yellow-100 text-yellow-700";
      case "Used":
        return "bg-orange-100 text-orange-700";
      case "New":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleContactDonor = () => {
    if (message.trim()) {
      Alert.alert(
        "Message Sent",
        `Your message has been sent to ${item.seller}!`,
        [{ text: "OK" }]
      );
      setMessage("");
    } else {
      Alert.alert("Please write a message", "Enter a message before sending.");
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
            source={{ uri: item.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Details Section */}
        <View className="px-5 py-5 bg-white -mt-8 rounded-t-3xl shadow-sm">
          {/* Title */}
          <Text className="text-2xl font-bold text-black mb-0 leading-7">
            {item.name}
          </Text>

          {/* Price */}
          <EmphasizedText
            text={
              item.price === 0
                ? "Free"
                : `<em>RM</em> ${(item.price || 0).toLocaleString("en-MY")}`
            }
            className={`text-2xl font-bold mt-1 mb-2 ${
              item.price === 0 ? "text-emerald-600" : "text-gray-800"
            }`}
            emClassName="text-xl font-bold"
          />

          {/* Item Info */}
          <View className="flex flex-row gap-6">
            <View>
              <Text className="text-xs text-gray-500 mb-1">Category</Text>
              <Text className="text-sm font-semibold text-black">
                {item.category}
              </Text>
            </View>

            <View>
              <Text className="text-xs text-gray-500 mb-1">Location</Text>
              <Text className="text-sm font-semibold text-black">
                {item.location || "N/A"}
              </Text>
            </View>
          </View>

          <View className="border-t border-gray-200 my-4" />

          {/* Description */}
          <View>
            <Text className="text-lg font-bold text-black mb-2">
              About This Item
            </Text>
            <Text className="text-sm text-gray-600 leading-6">
              This is a {item.condition.toLowerCase()}{" "}
              {item.category.toLowerCase()} item available for reuse. Part of
              our circular economy initiative to reduce waste in Penang and
              promote sustainable sharing culture.
            </Text>
          </View>

          <View className="border-t border-gray-200 my-6" />

          {/* Donor Section */}
          <Text className="text-lg font-bold text-black mb-3">
            About The Donor
          </Text>

          <View className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm">
            <View className="flex-row items-center mb-4">
              <Image
                source={{ uri: item.avatar }}
                className="w-12 h-12 rounded-full bg-gray-200"
              />

              <View className="ml-3 flex-1">
                <Text className="text-sm font-bold text-black">
                  {item.seller}
                </Text>
                <Text className="text-xs text-gray-500">{item.location}</Text>
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
              Send Message to {item.seller}
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

import { AuthPlaceholder } from "@/components/AuthPlaceholder";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Chat room type
interface ChatRoom {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  itemName?: string;
}

// Dummy chat rooms data
const dummyChatRooms: ChatRoom[] = [
  {
    id: "1",
    name: "Chistina Wong",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    lastMessage: "Yes, the batik shirt is still available!",
    timestamp: "10:30 AM",
    unreadCount: 2,
    isOnline: true,
    itemName: "Batik Shirt (L)",
  },
  {
    id: "2",
    name: "Amir Hassan",
    avatar:
      "https://static.vecteezy.com/system/resources/thumbnails/005/346/410/small/close-up-portrait-of-smiling-handsome-young-caucasian-man-face-looking-at-camera-on-isolated-light-gray-studio-background-photo.jpg",
    lastMessage: "Can pick up tomorrow at 3pm",
    timestamp: "9:15 AM",
    unreadCount: 0,
    isOnline: false,
    itemName: "Cotton Kurta Shirt",
  },
  {
    id: "3",
    name: "Ricky Owen",
    avatar: "https://randomuser.me/api/portraits/men/46.jpg",
    lastMessage: "The laptop is in good working condition 👍",
    timestamp: "Yesterday",
    unreadCount: 1,
    isOnline: true,
    itemName: "Dell Laptop",
  },
  {
    id: "4",
    name: "Asyikin",
    avatar: "https://randomuser.me/api/portraits/women/72.jpg",
    lastMessage: "Thank you for the dress! ❤️",
    timestamp: "Yesterday",
    unreadCount: 0,
    isOnline: false,
    itemName: "Kebaya Dress",
  },
  {
    id: "5",
    name: "Chris Paul",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    lastMessage: "Sure, I can deliver to your area",
    timestamp: "Mon",
    unreadCount: 0,
    isOnline: true,
    itemName: "Wood Chair Set",
  },
];

const MessagePage: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = dummyChatRooms.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.itemName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatPress = (chat: ChatRoom) => {
    (navigation as any).navigate("pages/chatRoom", {
      chatId: chat.id,
      name: chat.name,
      avatar: chat.avatar,
      itemName: chat.itemName || "",
      isOnline: chat.isOnline ? "true" : "false",
    });
  };

  if (!user) {
    return <AuthPlaceholder />;
  }

  return (
    <SafeAreaView className="flex h-full w-full bg-white">
      {/* Header */}
      <View className="px-4 pt-4 pb-2 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-2xl font-bold text-black">Messages</Text>
          <TouchableOpacity className="p-2">
            <MaterialIcons name="more-vert" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <MaterialIcons name="search" size={20} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search conversations"
            className="flex-1 ml-2 text-sm text-black"
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialIcons name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Chat List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              onPress={() => handleChatPress(chat)}
              activeOpacity={0.7}
              className="flex-row items-center px-4 py-3 border-b border-gray-50"
            >
              {/* Avatar with Online Indicator */}
              <View className="relative">
                <Image
                  source={{ uri: chat.avatar }}
                  className="w-14 h-14 rounded-full bg-gray-200"
                />
                {chat.isOnline && (
                  <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                )}
              </View>

              {/* Chat Info */}
              <View className="flex-1 ml-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-semibold text-black">
                    {chat.name}
                  </Text>
                  <Text
                    className={`text-xs ${chat.unreadCount > 0 ? "text-black font-semibold" : "text-gray-500"}`}
                  >
                    {chat.timestamp}
                  </Text>
                </View>

                {/* Item Name Tag */}
                {chat.itemName && (
                  <View className="flex-row items-center mt-0.5">
                    <View className="bg-gray-100 px-2 py-0.5 rounded-full">
                      <Text className="text-xs text-gray-600">
                        {chat.itemName}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Last Message & Unread Count */}
                <View className="flex-row items-center justify-between mt-1">
                  <Text
                    className={`text-sm flex-1 mr-2 ${chat.unreadCount > 0 ? "text-black font-medium" : "text-gray-500"}`}
                    numberOfLines={1}
                  >
                    {chat.lastMessage}
                  </Text>
                  {chat.unreadCount > 0 && (
                    <View className="bg-black rounded-full min-w-5 h-5 items-center justify-center px-1.5">
                      <Text className="text-white text-xs font-bold">
                        {chat.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <MaterialIcons
              name="chat-bubble-outline"
              size={64}
              color="#D1D5DB"
            />
            <Text className="text-gray-400 text-base mt-4">
              No conversations found
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-black rounded-full items-center justify-center shadow-lg"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 8,
        }}
      >
        <MaterialIcons name="chat" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default MessagePage;

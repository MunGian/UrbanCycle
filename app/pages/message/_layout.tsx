import { AuthPlaceholder } from "@/components/AuthPlaceholder";
import { MessageRoom } from "@/lib/api/apiModel";
import { supabase } from "@/lib/utils/supabase";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const MessagePage: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [rooms, setRooms] = useState<MessageRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) return;

    fetchRooms();

    const channel = supabase
      .channel("public:message_room")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_room",
          filter: `user1_id=eq.${user.id}`,
        },
        (payload) => handleRealtimeUpdate(payload)
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_room",
          filter: `user2_id=eq.${user.id}`,
        },
        (payload) => handleRealtimeUpdate(payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchRooms = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("message_room")
      .select("*, user1:user1_id(*), user2:user2_id(*)")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching rooms:", error);
    } else {
      setRooms(data || []);
    }
    setLoading(false);
  };

  const handleRealtimeUpdate = async (payload: any) => {
    if (payload.eventType === "INSERT") {
      const { data, error } = await supabase
        .from("message_room")
        .select("*, user1:user1_id(*), user2:user2_id(*)")
        .eq("id", payload.new.id)
        .single();

      if (!error && data) {
        setRooms((prev) => [data, ...prev]);
      }
    } else if (payload.eventType === "UPDATE") {
      setRooms((prev) => {
        const updatedRooms = prev.map((room) =>
          room.id === payload.new.id ? { ...room, ...payload.new } : room
        );
        return updatedRooms.sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      });
    } else if (payload.eventType === "DELETE") {
      setRooms((prev) => prev.filter((room) => room.id !== payload.old.id));
    }
  };

  const getOtherUser = (room: MessageRoom) => {
    if (room.user1_id === user?.id) return room.user2;
    return room.user1;
  };

  const getUnreadCount = (room: MessageRoom) => {
    if (room.user1_id === user?.id) return room.user1_unread_count || 0;
    return room.user2_unread_count || 0;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return date.toLocaleDateString();
  };

  const filteredRooms = rooms.filter((room) => {
    const otherUser = getOtherUser(room);
    const name = `${otherUser?.first_name} ${otherUser?.last_name}`;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleChatPress = (room: MessageRoom) => {
    const otherUser = getOtherUser(room);
    (navigation as any).navigate("pages/messageRoom", {
      chatId: room.id,
      name: `${otherUser?.first_name} ${otherUser?.last_name}`,
      avatar: otherUser?.avatar_url,
    });
  };

  if (!user) {
    return <AuthPlaceholder />;
  }

  return (
    <View className="flex h-full w-full bg-white">
      {/* Header */}
      <View className="px-4 pt-4 pb-2 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-2xl font-bold text-black">Messages</Text>
          <TouchableOpacity className="p-2">
            <MaterialIcons name="more-vert" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          className={`flex-row items-center bg-gray-100 rounded-full px-4 py-2 border ${isSearchFocused ? "border-black" : "border-transparent"}`}
        >
          <MaterialIcons name="search" size={20} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
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
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => {
            const otherUser = getOtherUser(room);
            const unreadCount = getUnreadCount(room);
            const name = `${otherUser?.first_name} ${otherUser?.last_name}`;

            return (
              <TouchableOpacity
                key={room.id}
                onPress={() => handleChatPress(room)}
                activeOpacity={0.7}
                className="flex-row items-center px-4 py-3 border-b border-gray-50"
              >
                {/* Avatar */}
                <View className="relative">
                  {otherUser?.avatar_url ? (
                    <Image
                      source={{ uri: otherUser.avatar_url }}
                      className="w-14 h-14 rounded-full bg-gray-200"
                    />
                  ) : (
                    <View className="w-14 h-14 rounded-full bg-gray-200 items-center justify-center">
                      <FontAwesome
                        name="user-circle-o"
                        size={42}
                        color="black"
                      />
                    </View>
                  )}
                </View>

                {/* Chat Info */}
                <View className="flex-1 ml-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-semibold text-black">
                      {name}
                    </Text>
                    <Text
                      className={`text-xs ${
                        unreadCount > 0
                          ? "text-black font-semibold"
                          : "text-gray-500"
                      }`}
                    >
                      {room.updated_at ? formatTime(room.updated_at) : ""}
                    </Text>
                  </View>

                  {/* Last Message & Unread Count */}
                  <View className="flex-row items-center justify-between mt-1">
                    <Text
                      className={`text-sm flex-1 mr-2 ${
                        unreadCount > 0
                          ? "text-black font-medium"
                          : "text-gray-500"
                      }`}
                      numberOfLines={1}
                    >
                      {room.last_message_sender_id === user?.id ? "You: " : ""}
                      {room.last_message || "No messages yet"}
                    </Text>
                    {unreadCount > 0 && (
                      <View className="bg-black rounded-full min-w-5 h-5 items-center justify-center px-1.5">
                        <Text className="text-white text-xs font-bold">
                          {unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
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
    </View>
  );
};

export default MessagePage;

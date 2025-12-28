import { Message } from "@/lib/api/apiModel";
import { supabase } from "@/lib/utils/supabase";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const PAGE_SIZE = 20;

const MessageRoomPage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  const { chatId, name, avatar, itemName, isOnline } = params;
  const user = useUserStore((s) => s.user);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!chatId || !user) return;

    fetchMessages();
    markAsRead();

    const channel = supabase
      .channel(`room:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "message",
          filter: `room_id=eq.${chatId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          // If the message is not from me, mark as read again (optional, or handle on focus)
          if (payload.new.sender_id !== user.id) {
            markAsRead();
          }
          // Scroll to bottom on new message
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, user]);

  useEffect(() => {
    const keyboardListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    return () => {
      keyboardListener.remove();
    };
  }, []);

  const fetchMessages = async (loadMore = false) => {
    if (loadMore) setLoadingHistory(true);

    const currentCount = loadMore ? messages.length : 0;
    const from = currentCount;
    const to = currentCount + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("message")
      .select("*")
      .eq("room_id", chatId)
      .order("created_at", { ascending: false }) // Fetch latest first
      .range(from, to);

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      const newMessages = data || [];
      if (newMessages.length < PAGE_SIZE) {
        setHasMore(false);
      }

      // Reverse to show oldest first
      const orderedMessages = newMessages.reverse();

      if (loadMore) {
        setMessages((prev) => [...orderedMessages, ...prev]);
      } else {
        setMessages(orderedMessages);
        // Scroll to bottom on initial load
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: false });
        }, 100);
      }
    }
    setLoadingHistory(false);
    setLoading(false);
  };

  const markAsRead = async () => {
    if (!user || !chatId) return;

    // Call the RPC function to reset unread count
    const { error } = await supabase.rpc("reset_unread_count", {
      p_room_id: chatId,
      p_user_id: user.id,
    });

    if (error) {
      console.error("Error resetting unread count:", error);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !user || !chatId) return;

    const content = newMessage.trim();
    setNewMessage(""); // Clear input immediately
    Keyboard.dismiss();

    const { error } = await supabase.from("message").insert({
      room_id: chatId,
      sender_id: user.id,
      content: content,
      type: "text",
    });

    if (error) {
      console.error("Error sending message:", error);
      // Optionally show error to user or restore message to input
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center flex-1 ml-2">
          <View className="relative">
            {avatar ? (
              <Image
                source={{ uri: avatar as string }}
                className="w-12 h-12 rounded-full bg-gray-200"
              />
            ) : (
              <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center">
                <FontAwesome name="user-circle-o" size={36} color="black" />
              </View>
            )}
            {isOnline === "true" && (
              <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </View>

          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-black">{name}</Text>
            <Text className="text-xs text-gray-500">
              {isOnline === "true" ? "Online" : "Last seen recently"}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="p-2">
          <MaterialIcons name="more-vert" size={22} color="black" />
        </TouchableOpacity>
      </View>

      {/* Item Context Banner */}
      {itemName && (
        <View className="flex-row items-center bg-gray-50 px-4 py-2 border-b border-gray-100">
          <MaterialIcons name="inventory-2" size={18} color="#6B7280" />
          <Text className="text-sm text-gray-600 ml-2">
            Discussing: <Text className="font-semibold">{itemName}</Text>
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
        >
          {/* View Chat History Button */}
          {hasMore && !loading && (
            <TouchableOpacity
              onPress={() => fetchMessages(true)}
              className="self-center bg-gray-100 px-4 py-2.5 rounded-full mb-1"
            >
              {loadingHistory ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <View className="flex-row items-center gap-2">
                  <FontAwesome5 name="history" size={16} color="#6B7280" />
                  <Text className="text-xs text-gray-600 font-medium">
                    View Chat History
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {messages.map((msg, index) => {
            const isMe = msg.sender_id === user?.id;
            const showDateDivider =
              index === 0 ||
              new Date(msg.created_at).toDateString() !==
                new Date(messages[index - 1].created_at).toDateString();

            return (
              <View key={msg.id} className="my-1">
                {/* Date Divider */}
                {showDateDivider && (
                  <View className="items-center my-4">
                    <Text className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                      {new Date(msg.created_at).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                )}

                {/* Message Bubble Container */}
                <View
                  className={`flex-row items-end mb-2 ${
                    isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Timestamp for My Message (Left of bubble) */}
                  {isMe && (
                    <Text className="text-[11px] text-gray-400 mr-2 mb-0.5">
                      {formatTime(msg.created_at)}
                    </Text>
                  )}

                  {/* Bubble */}
                  <View
                    className={`max-w-[75%] px-4 py-3 rounded-xl ${
                      isMe
                        ? "bg-gray-800 rounded-br-sm"
                        : "bg-gray-100 rounded-bl-sm"
                    }`}
                  >
                    <Text
                      className={`text-sm ${isMe ? "text-white" : "text-black"}`}
                    >
                      {msg.content}
                    </Text>
                  </View>

                  {/* Timestamp for Opponent Message (Right of bubble) */}
                  {!isMe && (
                    <Text className="text-[11px] text-gray-400 ml-2 mb-0.5">
                      {formatTime(msg.created_at)}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
          <View className="h-8" />
        </ScrollView>

        {/* Message Input */}
        <View className="flex-row items-center px-4 py-3 border-t border-gray-100 bg-white">
          <TouchableOpacity className="p-2">
            <MaterialIcons name="add" size={24} color="#6B7280" />
          </TouchableOpacity>

          <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2 mx-2">
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              className="flex-1 text-sm text-black"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={2}
              maxLength={500}
            />
          </View>

          <TouchableOpacity
            onPress={handleSendMessage}
            className="w-14 h-14 bg-gray-800 rounded-full items-center justify-center"
          >
            <MaterialIcons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default MessageRoomPage;

import { Message } from "@/lib/api/apiModel";
import { supabase } from "@/lib/utils/supabase";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import MessageBubble from "./components/MessageBubble";

const PAGE_SIZE = 20;

const MessageRoomPage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  const { chatId, name, avatar, itemName, isOnline } = params;
  const user = useUserStore((s) => s.user);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 0.5,
    });

    if (!result.canceled) {
      await Promise.all(
        result.assets.map((asset) => sendImageMessage(asset.uri))
      );
    }
  };

  const sendImageMessage = async (uri: string) => {
    if (!user || !chatId) return;

    try {
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      const fileName = `${chatId}/${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("chat-images")
        .upload(fileName, arrayBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("chat-images")
        .getPublicUrl(fileName);

      const imageUrl = data.publicUrl;

      const { error } = await supabase.from("message").insert({
        room_id: chatId,
        sender_id: user.id,
        content: imageUrl,
        type: "image",
      });

      if (error) {
        console.error("Error sending image message:", error);
        Alert.alert("Error", "Failed to send image message");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload image");
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

  const groupMessages = (msgs: Message[]) => {
    return msgs.reduce((acc: any[], current) => {
      const last = acc[acc.length - 1];

      if (
        last &&
        last.sender_id === current.sender_id &&
        last.type === "image" &&
        current.type === "image" &&
        new Date(last.created_at).toDateString() ===
          new Date(current.created_at).toDateString()
      ) {
        if (!last.images) {
          last.images = [last.content];
        }
        last.images.push(current.content);
        last.created_at = current.created_at; // Update time to latest
        return acc;
      }

      if (current.type === "image") {
        return [...acc, { ...current, images: [current.content] }];
      }

      return [...acc, current];
    }, []);
  };

  const groupedMessages = groupMessages(messages);

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

          {groupedMessages.map((msg, index) => {
            const isMe = msg.sender_id === user?.id;
            const showDateDivider =
              index === 0 ||
              new Date(msg.created_at).toDateString() !==
                new Date(groupedMessages[index - 1].created_at).toDateString();

            return (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isMe={isMe}
                showDateDivider={showDateDivider}
              />
            );
          })}
          <View className="h-8" />
        </ScrollView>

        {/* Message Input */}
        <View className="flex-row items-center px-4 py-3 border-t border-gray-100 bg-white">
          <TouchableOpacity className="p-2" onPress={pickImage}>
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

import { Message } from "@/api/apiModel";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
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

// Static messages for all chat rooms
const staticMessages: Message[] = [
  {
    id: "1",
    text: "Hi! I saw your item listed. Is it still available?",
    timestamp: "10:00 AM",
    isMe: true,
    status: "read",
  },
  {
    id: "2",
    text: "Hello! Yes, it's still available 😊",
    timestamp: "10:05 AM",
    isMe: false,
  },
  {
    id: "3",
    text: "Great! What's the condition like?",
    timestamp: "10:08 AM",
    isMe: true,
    status: "read",
  },
  {
    id: "4",
    text: "It's in very good condition, barely used. I can send more photos if you'd like!",
    timestamp: "10:12 AM",
    isMe: false,
  },
  {
    id: "5",
    text: "That would be helpful, thank you!",
    timestamp: "10:15 AM",
    isMe: true,
    status: "read",
  },
  {
    id: "6",
    text: "Here you go! Let me know if you have any questions 📷",
    timestamp: "10:20 AM",
    isMe: false,
  },
];

const ChatRoomPage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  console.log("ChatRoom params:", params);
  const { chatId, name, avatar, itemName, isOnline } = params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Load static messages
    setMessages(staticMessages);
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    Keyboard.dismiss();

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isMe: true,
      status: "sent",
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");

    // Simulate typing indicator and response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: getAutoResponse(newMessage),
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMe: false,
      };
      setMessages((prev) => [...prev, response]);
    }, 1500);
  };

  const getAutoResponse = (msg: string): string => {
    const lowerMsg = msg.toLowerCase();
    if (lowerMsg.includes("pickup") || lowerMsg.includes("collect")) {
      return "Sure! You can collect it anytime between 10am - 8pm. Just let me know when you're coming!";
    }
    if (lowerMsg.includes("condition")) {
      return "It's in great condition! I can send more photos if you'd like.";
    }
    if (lowerMsg.includes("available")) {
      return "Yes, it's still available! Would you like to arrange a pickup?";
    }
    if (lowerMsg.includes("thank")) {
      return "You're welcome! Happy to help reduce waste together 🌱";
    }
    return "Thanks for your message! I'll get back to you soon 😊";
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "read":
        return <MaterialIcons name="done-all" size={16} color="#3B82F6" />;
      case "delivered":
        return <MaterialIcons name="done-all" size={16} color="#9CA3AF" />;
      case "sent":
        return <MaterialIcons name="done" size={16} color="#9CA3AF" />;
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center flex-1 ml-2">
          <View className="relative">
            <Image
              source={{ uri: avatar as string }}
              className="w-10 h-10 rounded-full bg-gray-200"
            />
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

        {/* <TouchableOpacity className="p-2">
          <MaterialIcons name="call" size={22} color="black" />
        </TouchableOpacity> */}
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

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: false })
        }
      >
        {messages.map((msg, index) => {
          const showTimestamp =
            index === 0 || messages[index - 1].timestamp !== msg.timestamp;

          return (
            <View key={msg.id}>
              {/* Timestamp Divider */}
              {showTimestamp && (
                <View className="items-center my-2">
                  <Text className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    {msg.timestamp}
                  </Text>
                </View>
              )}

              {/* Message Bubble */}
              <View
                className={`flex-row ${msg.isMe ? "justify-end" : "justify-start"} mb-2`}
              >
                <View
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                    msg.isMe
                      ? "bg-gray-800 rounded-br-sm"
                      : "bg-gray-100 rounded-bl-sm"
                  }`}
                >
                  <Text
                    className={`text-sm ${msg.isMe ? "text-white" : "text-black"}`}
                  >
                    {msg.text}
                  </Text>

                  {/* Message Status (for sent messages) */}
                  {msg.isMe && (
                    <View className="flex-row justify-end items-center mt-1">
                      {getStatusIcon(msg.status)}
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <View className="flex-row justify-start mb-2">
            <View className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
              <View className="flex-row items-center space-x-1">
                <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
              </View>
            </View>
          </View>
        )}
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
            maxLength={500}
          />
          {/* <TouchableOpacity className="ml-2">
            <MaterialIcons name="emoji-emotions" size={22} color="#9CA3AF" />
          </TouchableOpacity> */}
        </View>

        <TouchableOpacity
          onPress={handleSendMessage}
          className="w-14 h-14 bg-gray-800 rounded-full items-center justify-center"
        >
          <MaterialIcons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatRoomPage;

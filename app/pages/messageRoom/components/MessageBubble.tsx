import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface MessageBubbleProps {
  msg: {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
    type?: "text" | "image";
    images?: string[];
  };
  isMe: boolean;
  showDateDivider: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  msg,
  isMe,
  showDateDivider,
}) => {
  const router = useRouter();
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const { width } = Dimensions.get("window");

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleImagePress = (images: string[]) => {
    if (images.length === 1) {
      setFullScreenImage(images[0]);
    } else {
      router.push({
        pathname: "/pages/messageImageDetails",
        params: { images: JSON.stringify(images) },
      });
    }
  };

  const renderImages = () => {
    const images = msg.images || [msg.content];
    if (images.length === 1) {
      return (
        <TouchableOpacity
          onPress={() => handleImagePress(images)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: images[0] }}
            className="w-48 h-48 rounded-lg"
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }

    const displayImages = images.slice(0, 2);
    const remainingCount = images.length - 2;

    return (
      <TouchableOpacity
        onPress={() => handleImagePress(images)}
        activeOpacity={0.9}
      >
        <View className="flex-row gap-1 w-full">
          {displayImages.map((img, index) => (
            <View key={index} className="relative">
              <Image
                source={{ uri: img }}
                className={`rounded-lg ${
                  images.length === 2
                    ? "w-[92px] h-[92px]"
                    : "w-[92px] h-[92px]"
                }`}
                resizeMode="cover"
              />
              {index === 1 && remainingCount > 0 && (
                <View className="absolute inset-0 bg-black/50 rounded-lg items-center justify-center">
                  <Text className="text-white font-bold text-lg">
                    +{remainingCount}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="my-1">
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
            isMe ? "bg-gray-800 rounded-br-sm" : "bg-gray-100 rounded-bl-sm"
          }`}
        >
          {msg.type === "image" ? (
            renderImages()
          ) : (
            <Text className={`text-sm ${isMe ? "text-white" : "text-black"}`}>
              {msg.content}
            </Text>
          )}
        </View>

        {/* Timestamp for Opponent Message (Right of bubble) */}
        {!isMe && (
          <Text className="text-[11px] text-gray-400 ml-2 mb-0.5">
            {formatTime(msg.created_at)}
          </Text>
        )}
      </View>

      {/* Full Screen Image Modal */}
      <Modal
        visible={!!fullScreenImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullScreenImage(null)}
      >
        <View className="flex-1 bg-black justify-center items-center relative">
          <SafeAreaView className="absolute top-0 left-0 right-0 z-10">
            <TouchableOpacity
              className="p-4 items-start"
              onPress={() => setFullScreenImage(null)}
            >
              <MaterialIcons name="close" size={30} color="white" />
            </TouchableOpacity>
          </SafeAreaView>

          {fullScreenImage && (
            <Image
              source={{ uri: fullScreenImage }}
              style={{ width: width, height: "100%" }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

export default MessageBubble;

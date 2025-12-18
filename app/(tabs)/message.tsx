import React from "react";
import { View } from "react-native";
import MessagePage from "../pages/message/_layout";

const Message: React.FC = () => {
  return (
    <View className="flex-1 bg-white">
      <MessagePage />
    </View>
  );
};

export default Message;

import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface SuccessModalProps {
  onClose: () => void;
  title: string;
  description: string;
  confirmText?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  onClose,
  title,
  description,
  confirmText = "Done",
}) => {
  return (
    <View className="items-center px-6 pb-10 pt-4">
      <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
        <MaterialIcons name="check-circle" size={48} color="#16A34A" />
      </View>
      <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
        {title}
      </Text>
      <Text className="text-gray-500 text-center mb-8 leading-6 text-base">
        {description}
      </Text>
      <TouchableOpacity
        onPress={onClose}
        className="w-full bg-black py-4 rounded-full items-center active:opacity-90 shadow-sm"
      >
        <Text className="text-white font-bold text-lg">{confirmText}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SuccessModal;

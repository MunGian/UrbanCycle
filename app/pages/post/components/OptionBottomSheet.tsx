import { SooBottomSheet } from "@/components/SooBottomSheetController";
import React, { useEffect, useRef } from "react";
import { Text, TouchableOpacity } from "react-native";
import { FlatList } from "react-native-gesture-handler";

export interface BottomSheetOption {
  label: string;
  value: string;
}

interface OptionBottomSheetProps {
  options: BottomSheetOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  paddingBottom?: number;
}

const OptionBottomSheet: React.FC<OptionBottomSheetProps> = ({
  options,
  selectedValue,
  onSelect,
  paddingBottom = 0,
}) => {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const index = options.findIndex((o) => o.value === selectedValue);
    if (index !== -1) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index,
          animated: false,
          viewPosition: 0.5,
        });
      }, 50);
    }
  }, []);

  return (
    <FlatList
      ref={flatListRef}
      data={options}
      keyExtractor={(item) => item.value}
      className={`max-h-96`}
      contentContainerStyle={{
        paddingBottom: paddingBottom,
      }}
      showsVerticalScrollIndicator={false}
      onScrollToIndexFailed={(info) => {
        const wait = new Promise((resolve) => setTimeout(resolve, 500));
        wait.then(() => {
          flatListRef.current?.scrollToIndex({
            index: info.index,
            animated: true,
            viewPosition: 0.5,
          });
        });
      }}
      renderItem={({ item }) => {
        const isSelected = item.value === selectedValue;
        return (
          <TouchableOpacity
            className={`py-5 border-b border-gray-100 ${
              isSelected ? "bg-gray-200" : "bg-white"
            } ${options.length}`}
            onPress={() => {
              onSelect(item.value);
              SooBottomSheet.pop();
            }}
          >
            <Text
              className={`text-center text-base ${
                isSelected ? "text-lg text-black font-bold" : "text-gray-600"
              }`}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
};

export default OptionBottomSheet;

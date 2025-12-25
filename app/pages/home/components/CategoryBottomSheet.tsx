import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface CategoryBottomSheetProps {
  category: string[];
  selectedCategory: string;
  setSelectedCategoryCallback: (category: string) => void;
}

const CategoryBottomSheet: React.FC<CategoryBottomSheetProps> = ({
  category,
  selectedCategory,
  setSelectedCategoryCallback,
}) => {
  return (
    <View className="flex-row flex-wrap gap-3 pb-12">
      {category.map((cat) => {
        const active = cat === selectedCategory;
        return (
          <TouchableOpacity
            key={cat}
            activeOpacity={0.7}
            onPress={() => {
              setSelectedCategoryCallback(cat);
            }}
            className={`px-4 py-2.5 rounded-full border-2 ${
              active ? "bg-black border-black" : "bg-gray-50 border-gray-300"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                active ? "text-white" : "text-gray-700"
              }`}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default CategoryBottomSheet;

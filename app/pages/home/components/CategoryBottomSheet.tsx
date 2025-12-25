import OptionBottomSheet, {
  BottomSheetOption,
} from "@/app/pages/post/components/OptionBottomSheet";
import React from "react";

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
  const options: BottomSheetOption[] = category.map((cat) => ({
    label: cat,
    value: cat,
  }));

  return (
    <OptionBottomSheet
      options={options}
      selectedValue={selectedCategory}
      onSelect={setSelectedCategoryCallback}
      paddingBottom={32}
    />
  );
};

export default CategoryBottomSheet;

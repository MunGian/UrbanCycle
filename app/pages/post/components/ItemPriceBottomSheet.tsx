import React from "react";
import OptionBottomSheet from "./OptionBottomSheet";

interface ItemPriceBottomSheetProps {
  isFree: boolean;
  setIsFree: (isFree: boolean) => void;
  setPrice: (price: string) => void;
}

const ItemPriceBottomSheet: React.FC<ItemPriceBottomSheetProps> = ({
  isFree,
  setIsFree,
  setPrice,
}) => {
  const priceOptions = [
    { label: "Free", value: "free" },
    { label: "Paid", value: "paid" },
  ];

  return (
    <OptionBottomSheet
      options={priceOptions}
      paddingBottom={32}
      selectedValue={isFree ? "free" : "paid"}
      onSelect={(value) => {
        if (value === "free") {
          setIsFree(true);
          setPrice("");
        } else {
          setIsFree(false);
        }
      }}
    />
  );
};

export default ItemPriceBottomSheet;

import { SooBottomSheet } from "@/components/SooBottomSheetProvider";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { BackHandler } from "react-native";

export const useBottomSheetBackHandler = () => {
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        const stackCount = SooBottomSheet.getStackCount?.() ?? 0;
        if (stackCount > 0) {
          SooBottomSheet.pop();
          return true; // Prevent default behavior (exit app/go back)
        }
        return false; // Let default behavior happen
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [])
  );
};

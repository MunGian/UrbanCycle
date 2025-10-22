import { SooBottomSheet } from "@/components/SooBottomSheetProvider";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";

export const useBottomSheetBackHandler = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      const stackCount = SooBottomSheet.getStackCount?.() ?? 0;
      console.log("BottomSheet StackCount =", stackCount);
      // Ensure the bottom sheet will close first instead of the background stack
      // when user using swipe-from-edge or related gesture (like goBack())
      if (stackCount > 0) {
        e.preventDefault(); // stop screen pop when bottom sheet stack still exists (more than 0)
        SooBottomSheet.pop(); // close top sheet
      }
    });

    return unsubscribe;
  }, [navigation]);
};

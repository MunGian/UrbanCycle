import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  TouchableWithoutFeedback,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useRef } from "react";
import {
  Dimensions,
  Keyboard,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SooBottomSheet as BottomSheetController } from "./SooBottomSheetController";

const { height: screenHeight } = Dimensions.get("window");

interface SooBottomSheetProps {
  sheetId: number;
  title?: string;
  child: React.ReactNode;
  isClosing?: boolean;
  needPadding?: boolean;
  needCloseButton?: boolean;
  isDismissible?: boolean;
}

const SooBottomSheet: React.FC<SooBottomSheetProps> = ({
  sheetId,
  title,
  child,
  isClosing = false,
  needPadding = false,
  needCloseButton = true,
  isDismissible = true,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Automatically close when flagged, to handle swipe-from-edge or related native gesture to close
  useEffect(() => {
    if (isClosing) {
      bottomSheetRef.current?.close();
    }
  }, [isClosing]);

  const closeSheet = () => {
    bottomSheetRef.current?.close(); // to have the slide down effect if multiple sheets exist
    Keyboard.dismiss();
    // then only run BottomSheetController.pop() in BottomSheet's onClose(), to give closure a smoother effect
    // BottomSheetController.pop(); // remove from stack in provider
  };

  const handleSheetChanges = useCallback((index: number) => {
    console.log(`BottomSheet ${sheetId} index changed:`, index);
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior={isDismissible ? "close" : "none"}
        onPress={closeSheet}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      enableDynamicSizing={true}
      enablePanDownToClose={isDismissible}
      enableHandlePanningGesture={true}
      enableContentPanningGesture={true}
      enableOverDrag={false}
      enableBlurKeyboardOnGesture={true}
      android_keyboardInputMode="adjustResize"
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      onChange={handleSheetChanges}
      onClose={() => {
        // This will run after the slide-down animation
        BottomSheetController.pop();
      }}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
      }}
      handleIndicatorStyle={{
        backgroundColor: "#bbbbbbff",
        width: 80,
        height: 4,
        borderRadius: 4,
      }}
    >
      <BottomSheetView>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ paddingHorizontal: needPadding ? 16 : 0 }}>
            <View
              style={{
                paddingHorizontal: needPadding ? 0 : 16,
                paddingTop: 6,
                paddingBottom: 14,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "600", color: "#333" }}>
                {title}
              </Text>
              {needCloseButton && (
                <TouchableOpacity onPress={closeSheet}>
                  <Ionicons name="close" size={32} color="gray" />
                </TouchableOpacity>
              )}
            </View>
            {child}
          </View>
        </TouchableWithoutFeedback>
      </BottomSheetView>
    </BottomSheet>
  );
};

export default SooBottomSheet;

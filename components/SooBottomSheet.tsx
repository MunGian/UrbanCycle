import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  TouchableWithoutFeedback,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useRef } from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SooBottomSheet as BottomSheetController } from "./SooBottomSheetProvider";

const { height: screenHeight } = Dimensions.get("window");

interface SooBottomSheetProps {
  sheetId: number;
  title?: string;
  child: React.ReactNode;
  needPadding?: boolean;
}

const SooBottomSheet: React.FC<SooBottomSheetProps> = ({
  sheetId,
  title,
  child,
  needPadding = false,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const closeSheet = () => {
    bottomSheetRef.current?.close(); // to have the slide down effect if multiple sheets exist
    Keyboard.dismiss();
    // then only run BottomSheetController.pop() in BoToomSheet's onClose(), to give closure a smoother effect
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
      enablePanDownToClose={true}
      enableHandlePanningGesture={true}
      enableContentPanningGesture={true}
      enableOverDrag={false}
      enableBlurKeyboardOnGesture={true}
      keyboardBehavior="extend"
      keyboardBlurBehavior="none"
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
      <BottomSheetView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          keyboardVerticalOffset={80}
          behavior={"height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <View style={{ paddingHorizontal: needPadding ? 16 : 0, flex: 1 }}>
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
                <Text
                  style={{ fontSize: 20, fontWeight: "600", color: "#333" }}
                >
                  {title}
                </Text>
                <TouchableOpacity onPress={closeSheet}>
                  <Ionicons name="close" size={32} color="gray" />
                </TouchableOpacity>
              </View>
              {child}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </BottomSheetView>
    </BottomSheet>
  );
};

export default SooBottomSheet;

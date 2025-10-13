import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  TouchableWithoutFeedback,
} from "@gorhom/bottom-sheet";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height: screenHeight } = Dimensions.get("window");

export interface SooBottomSheetRef {
  openSheet: (
    title?: string,
    child?: React.ReactNode,
    needPadding?: boolean
  ) => void;
  closeSheet: () => void;
}

export const SooBottomSheet = forwardRef<SooBottomSheetRef>((_, ref) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [title, setTitle] = useState<string>("");
  const [child, setChild] = useState<React.ReactNode>(null);
  const [needPadding, setNeedPadding] = useState<boolean>(false);
  // const snapPoints = useMemo(() => ["30%"], []);

  const openSheet = (
    newTitle?: string,
    newChild?: React.ReactNode,
    needPadding?: boolean
  ) => {
    if (newTitle) setTitle(newTitle);
    if (newChild) setChild(newChild);
    setNeedPadding(needPadding ?? false);
    bottomSheetRef.current?.expand();
  };

  const closeSheet = () => {
    bottomSheetRef.current?.close();
    Keyboard.dismiss();
  };

  useImperativeHandle(ref, () => ({
    openSheet,
    closeSheet,
  }));

  const handleSheetChanges = useCallback((index: number) => {
    console.log("BottomSheet index changed:", index);
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        onPress={() => closeSheet()}
        // pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      // snapPoints={snapPoints}
      // snapPoints={["80%"]}
      index={-1}
      enableDynamicSizing={true} // no use snapPoints, allow sheet to grow with content (flex)
      enablePanDownToClose={true}
      enableHandlePanningGesture={true}
      enableContentPanningGesture={false} // if ltr gt list inside, check back this
      enableOverDrag={false}
      enableBlurKeyboardOnGesture={true}
      keyboardBehavior="extend"
      keyboardBlurBehavior="none"
      onClose={closeSheet} // 👈 extra safety: ensures keyboard is closed
      onChange={handleSheetChanges}
      // Remove
      // onAnimate={(fromIndex, toIndex) => {
      //   if (toIndex === -1 || fromIndex === 0) {
      //     Keyboard.dismiss();
      //   }
      // }}
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
      <BottomSheetView className="bg-body">
        <KeyboardAvoidingView
          keyboardVerticalOffset={80}
          behavior={"height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <View
              style={{ paddingHorizontal: needPadding ? 16 : 0 }}
              className="flex flex-col"
            >
              <View
                style={{
                  paddingHorizontal: needPadding ? 0 : 16,
                  paddingTop: 6,
                  paddingBottom: 16,
                }}
                className="flex flex-row justify-between items-center"
              >
                <Text className="text-grayT1 text-xl font-semibold">
                  {title}
                </Text>
                <TouchableOpacity onPress={closeSheet}>
                  <Ionicons name="close" size={32} color="gray" />
                </TouchableOpacity>
              </View>
              {/* <View className="h-[1px] w-full bg-brandPrimary" /> */}
              {child}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </BottomSheetView>
    </BottomSheet>
  );
});

SooBottomSheet.displayName = "SooBottomSheet";

export default SooBottomSheet;

import { icon } from "@/constants/navicon";
import { PlatformPressable } from "@react-navigation/elements";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export const TabBarButton = ({
  onPress,
  onLongPress,
  isFocused,
  routeName,
  color,
  label,
}: {
  onPress: (
    event:
      | import("react-native").GestureResponderEvent
      | React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => void;
  onLongPress: (
    event:
      | import("react-native").GestureResponderEvent
      | React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => void;
  isFocused: boolean;
  routeName: keyof typeof icon;
  color: string;
  label: string;
}) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(
      typeof isFocused === "boolean" ? (isFocused ? 1 : 0) : isFocused,
      { duration: 600 }
    );
  }, [scale, isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.2]);
    const top = interpolate(scale.value, [0, 1], [0, 10]);
    return { transform: [{ scale: scaleValue }], top };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [0, 1], [1, 0]);
    return { opacity };
  });

  return (
    <PlatformPressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabbarItem}
    >
      <Animated.View style={animatedIconStyle}>
        {icon[routeName]({
          color: isFocused ? "#FFF" : "#222",
        })}
      </Animated.View>
      <Animated.Text
        style={[{ color: color, fontSize: 12 }, animatedTextStyle]}
      >
        {label}
      </Animated.Text>
    </PlatformPressable>
  );
};

const styles = StyleSheet.create({
  tabbarItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
});

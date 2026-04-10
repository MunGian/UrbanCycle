import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { TabBarButton } from "./TabBarButton";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { SooBottomSheet } from "./SooBottomSheetProvider";
import AlertModal from "./AlertModal";

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const user = useUserStore((s) => s.user);
  const [dimensions, setDimensions] = useState({ width: 20, height: 100 });
  const buttonWidth = dimensions.width / state.routes.length;
  const tabPositionX = useSharedValue(0);

  const onTabbarLayout = (event: any) => {
    setDimensions({
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return { transform: [{ translateX: tabPositionX.value }] };
  });

  useEffect(() => {
    tabPositionX.value = withSpring(buttonWidth * state.index, {
      duration: 600,
    });
  }, [state.index]);

  const onUnloginAlert = () => {
    SooBottomSheet.push({
      needPadding: false,
      isDismissible: true,
      child: (
        <AlertModal
          title="Please login"
          description="You need to be logged in to access this feature."
          status="failed"
          confirmText="Go to Login"
          onClose={() => {
            SooBottomSheet.pop();
            (navigation as any).navigate("auth");
          }}
        />
      ),
    });
  };

  return (
    <View onLayout={onTabbarLayout} style={styles.tabBar}>
      <Animated.View
        style={[
          {
            position: "absolute",
            backgroundColor: "#353839",
            borderRadius: 30,
            marginHorizontal: 8,
            height: dimensions.height - 15,
            width: buttonWidth - 16,
          },
          animatedStyle,
        ]}
      />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          if (
            !user &&
            route.name !== "profile" &&
            route.name !== "home" &&
            route.name !== "report"
          ) {
            onUnloginAlert();
            return;
          }
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TabBarButton
            key={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={
              route.name as "home" | "message" | "post" | "report" | "profile"
            }
            color={isFocused ? "#414a4c" : "#222"}
            label={typeof label === "string" ? label : "route.name"}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    position: "absolute",
    bottom: 10,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 35,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
    elevation: 4,
  },
});

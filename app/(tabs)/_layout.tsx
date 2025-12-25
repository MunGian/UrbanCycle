import { TabBar } from "@/components/TabBar";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          title: "Messages",
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: "Post",
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: "Report",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}

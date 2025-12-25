import { ListedItem } from "@/lib/api/apiModel";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React from "react";
import MyListingsTab from "./MyListingsTab";
import ListItemTab from "./PostItemTab";

const Tab = createMaterialTopTabNavigator();

interface PostTabsProps {
  listedItems: ListedItem[];
  onPostItem: (item: ListedItem) => void;
  onRefresh: () => Promise<void>;
}

const PostTabs: React.FC<PostTabsProps> = ({
  listedItems,
  onPostItem,
  onRefresh,
}) => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
        },
        tabBarIndicatorStyle: {
          backgroundColor: "#000000",
          height: 3,
        },
        tabBarLabelStyle: {
          fontWeight: "700",
          fontSize: 12,
          textTransform: "none",
        },
        tabBarActiveTintColor: "#000000",
        tabBarInactiveTintColor: "#9CA3AF",
        animationEnabled: true,
      }}
    >
      <Tab.Screen name="MyListings" options={{ title: "My Listings" }}>
        {() => (
          <MyListingsTab listedItems={listedItems} onRefresh={onRefresh} />
        )}
      </Tab.Screen>
      <Tab.Screen name="ListItem" options={{ title: "Post Item" }}>
        {({ navigation }) => (
          <ListItemTab
            onPostItem={onPostItem}
            jumpToMyListings={() => navigation.navigate("MyListings")}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default PostTabs;

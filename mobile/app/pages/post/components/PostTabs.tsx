import { ListedItem } from "@/lib/api/apiModel";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React, { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import MyListingsTab from "./MyListingsTab";
import ListItemTab from "./PostItemTab";

const Tab = createMaterialTopTabNavigator();

interface PostTabsProps {
  listedItems: ListedItem[];
  onPostItem: (item: ListedItem) => void;
  onRefresh: () => Promise<void>;
  isMounting: boolean;
}

const PostTabs: React.FC<PostTabsProps> = ({
  listedItems,
  onPostItem,
  onRefresh,
  isMounting,
}) => {
  const [itemToEdit, setItemToEdit] = useState<ListedItem | null>(null);

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
      <Tab.Screen
        name="MyListings"
        options={{ title: "My Listings" }}
        listeners={{
          focus: () => setItemToEdit(null),
        }}
      >
        {({ navigation }) =>
          isMounting ? (
            <View className="flex-1 bg-white items-center justify-center">
              <ActivityIndicator size="large" color="#2c323d" />
            </View>
          ) : (
            <MyListingsTab
              listedItems={listedItems}
              onRefresh={onRefresh}
              onEdit={(item) => {
                setItemToEdit(item);
                navigation.navigate("ListItem");
              }}
            />
          )
        }
      </Tab.Screen>
      <Tab.Screen
        name="ListItem"
        options={{ title: itemToEdit ? "Edit Item" : "Post Item" }}
      >
        {({ navigation }) => (
          <ListItemTab
            onPostItem={onPostItem}
            jumpToMyListings={() => {
              setItemToEdit(null);
              navigation.navigate("MyListings");
            }}
            itemToEdit={itemToEdit}
            onCancelEdit={() => {
              setItemToEdit(null);
              navigation.navigate("MyListings");
            }}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default PostTabs;

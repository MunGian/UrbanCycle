import { MarketplaceItem } from "@/lib/api/apiModel";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React, { FC, useMemo } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

const Tab = createMaterialTopTabNavigator();

interface MarketplaceTabsProps {
  query: string;
  selectedCategory: string;
  renderItem: (item: { item: MarketplaceItem }) => React.ReactElement;
  marketplaceData: MarketplaceItem[];
  onRefresh: () => Promise<void>;
  refreshing: boolean;
}

interface MarketplaceTabContentProps {
  items: MarketplaceItem[];
  renderItem: (item: { item: MarketplaceItem }) => React.ReactElement;
  emptyMessage?: string;
  onRefresh: () => Promise<void>;
  refreshing: boolean;
}

const MarketplaceTabContent: FC<MarketplaceTabContentProps> = ({
  items,
  renderItem,
  emptyMessage = "No items found.",
  onRefresh,
  refreshing,
}) => {
  return (
    <ScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Pressable className="flex-1">
        <View className="flex-row flex-wrap px-2 pb-24 pt-2 justify-between">
          {items.length > 0 ? (
            items.map((item) => renderItem({ item }))
          ) : (
            <View className="items-center justify-center py-8 h-96 w-full">
              <Text className="text-gray-500">{emptyMessage}</Text>
            </View>
          )}
        </View>
      </Pressable>
    </ScrollView>
  );
};

const AllItemsTab: FC<MarketplaceTabsProps> = ({
  query,
  selectedCategory,
  marketplaceData,
  renderItem,
  onRefresh,
  refreshing,
}) => {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return marketplaceData.filter((it) => {
      const matchesCategory =
        selectedCategory === "All" ||
        it.listed_item.category === selectedCategory;
      const matchesQuery =
        q === "" ||
        it.listed_item.title.toLowerCase().includes(q) ||
        (it.user ? `${it.user.first_name} ${it.user.last_name}` : "")
          .toLowerCase()
          .includes(q) ||
        (it.listed_item.location || "").toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory, marketplaceData]);

  return (
    <MarketplaceTabContent
      items={filtered}
      renderItem={renderItem}
      onRefresh={onRefresh}
      refreshing={refreshing}
    />
  );
};

const FreeItemsTab: FC<MarketplaceTabsProps> = ({
  query,
  selectedCategory,
  marketplaceData,
  renderItem,
  onRefresh,
  refreshing,
}) => {
  const freeItems = useMemo(() => {
    return marketplaceData.filter(
      (item) => item.listed_item.is_free || item.listed_item.price === 0
    );
  }, [marketplaceData]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return freeItems.filter((it) => {
      const matchesCategory =
        selectedCategory === "All" ||
        it.listed_item.category === selectedCategory;
      const matchesQuery =
        q === "" ||
        it.listed_item.title.toLowerCase().includes(q) ||
        (it.user ? `${it.user.first_name} ${it.user.last_name}` : "")
          .toLowerCase()
          .includes(q) ||
        (it.listed_item.location || "").toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory, freeItems]);

  return (
    <MarketplaceTabContent
      items={filtered}
      renderItem={renderItem}
      emptyMessage="No free items found."
      onRefresh={onRefresh}
      refreshing={refreshing}
    />
  );
};

const NearbyTab: FC<MarketplaceTabsProps> = ({
  query,
  selectedCategory,
  marketplaceData,
  renderItem,
  onRefresh,
  refreshing,
}) => {
  const nearbyItems = useMemo(() => {
    const nearbyLocations = [
      "Gelugor",
      "Bayan Lepas",
      "Ayer Itam",
      "Jelutong",
      "Bukit Mertajam",
      "George Town",
      "Butterworth",
      "Tanjung Bungah",
      "Seberang Jaya",
      "Bayan Baru",
      "Balik Pulau",
      "USM Gelugor",
    ];
    return marketplaceData.filter((item) =>
      nearbyLocations.includes(item.listed_item.location || "")
    );
  }, [marketplaceData]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return nearbyItems.filter((it) => {
      const matchesCategory =
        selectedCategory === "All" ||
        it.listed_item.category === selectedCategory;
      const matchesQuery =
        q === "" ||
        it.listed_item.title.toLowerCase().includes(q) ||
        (it.user ? `${it.user.first_name} ${it.user.last_name}` : "")
          .toLowerCase()
          .includes(q) ||
        (it.listed_item.location || "").toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory, nearbyItems]);

  return (
    <MarketplaceTabContent
      items={filtered}
      renderItem={renderItem}
      onRefresh={onRefresh}
      refreshing={refreshing}
    />
  );
};

const ForMeTab: FC<MarketplaceTabsProps> = ({
  query,
  selectedCategory,
  marketplaceData,
  renderItem,
  onRefresh,
  refreshing,
}) => {
  const forMeItems = useMemo(() => {
    const shuffled = [...marketplaceData].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.ceil(marketplaceData.length * 0.7));
  }, [marketplaceData]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return forMeItems.filter((it) => {
      const matchesCategory =
        selectedCategory === "All" ||
        it.listed_item.category === selectedCategory;
      const matchesQuery =
        q === "" ||
        it.listed_item.title.toLowerCase().includes(q) ||
        (it.user ? `${it.user.first_name} ${it.user.last_name}` : "")
          .toLowerCase()
          .includes(q) ||
        (it.listed_item.location || "").toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory, forMeItems]);

  return (
    <MarketplaceTabContent
      items={filtered}
      renderItem={renderItem}
      onRefresh={onRefresh}
      refreshing={refreshing}
    />
  );
};

const MarketplaceTabs: FC<MarketplaceTabsProps> = (props) => {
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
        tabBarScrollEnabled: true,
      }}
    >
      <Tab.Screen name="AllItems" options={{ title: "All Items" }}>
        {() => <AllItemsTab {...props} />}
      </Tab.Screen>
      <Tab.Screen name="FreeItems" options={{ title: "Free Items" }}>
        {() => <FreeItemsTab {...props} />}
      </Tab.Screen>
      <Tab.Screen name="Nearby" options={{ title: "Nearby" }}>
        {() => <NearbyTab {...props} />}
      </Tab.Screen>
      <Tab.Screen name="ForMe" options={{ title: "For Me" }}>
        {() => <ForMeTab {...props} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default MarketplaceTabs;
